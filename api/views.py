from rest_framework.response import Response 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from guff.models import UserProfile, SubscriptionPlan, UserSubscription, Payment
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from .serializers import ProfileSerializer, DiscordSerializer, WhatsAppSerializer
from .subscription_serializers import UserSubSerializer, PlanSerializer, PaymentSerializer 

import hmac
import hashlib
import base64
import uuid
import json
from datetime import timedelta

@api_view(['GET'])
def test(request):
    return Response({'res':'works'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userprofile(request):
    """
    Checks if user is authenticated and returns the username
    """
    user = get_object_or_404(UserProfile, user=request.user)
    return Response(ProfileSerializer(user).data, status=200)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getuser(request, username):
    """
    Gets username of requested user
    
    :param username: username of the user passed in URL
    """
    user_obj = get_object_or_404(User, username=username)
    user = get_object_or_404(UserProfile, user=user_obj)
    return Response(ProfileSerializer(user).data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getplans(request, username):
    """
    Returns plans created by creator

    :param username: creator's username passed in URL
    """
    creator = get_object_or_404(UserProfile, user__username=username)
    if not creator.is_creator:
        return Response({"error": "user is not a creator"}, status=403)
    plans = SubscriptionPlan.objects.filter(creator=creator).select_related('creator__user')
    return Response({"plans": PlanSerializer(plans, many=True).data}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def plans(request):
    """
    Allows creator to create a new plan if authenticated
    """
    creator_profile = get_object_or_404(UserProfile, user=request.user)

    if not creator_profile.is_creator:
        return Response({'error': 'user is not a creator'}, status=403)

    serializer = PlanSerializer(data=request.data, context={'creator': creator_profile})
    if serializer.is_valid():
        serializer.save(creator=creator_profile)  
        return Response(serializer.data, status=201)
    else:
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def plan_details(request, plan_id):
    """
    returns details of specified plan or updates it
    """
    plan = get_object_or_404(SubscriptionPlan, id=plan_id)
    
    if request.method == 'GET':
        return Response(PlanSerializer(plan).data, status=200)
    
    if request.method == 'PATCH':
        if plan.creator.user != request.user:
            return Response({"error": "not authorized"}, status=403)
            
        serializer = PlanSerializer(plan, data=request.data, partial=True, context={'creator': plan.creator})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def subscriptions(request):
    """
    adds or returns plans subscribed by the user for respective method
    """
    user = get_object_or_404(UserProfile, user=request.user)
    if user.is_creator:
        return Response({"error": "trying to access using creator account"}, status=403)
    
    if request.method == 'GET':
        plans = UserSubscription.objects.filter(buyer=user).select_related('buyer__user', 'plan')
        return Response({"plans":UserSubSerializer(plans, many=True).data}, status=200)
    
    if request.method == "POST":
        serializer = UserSubSerializer(data=request.data, context={"buyer": user})
        if serializer.is_valid():
            serializer.save(buyer=user)  
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_sub(request, id):
    """
    Disable user subscription
    :param id: id of plan to be disabled, passed in url
    """
    buyer = get_object_or_404(UserProfile, user=request.user)
    subscription = get_object_or_404(UserSubscription, buyer=buyer, id=id)
    subscription.is_active = False
    return Response({"status":"ok"}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Initiates payment and returns eSewa form parameters
    """
    user = get_object_or_404(UserProfile, user=request.user)
    plan_id = request.data.get('plan_id')
    gateway = request.data.get('gateway', 'ES') 

    plan = get_object_or_404(SubscriptionPlan, id=plan_id)
    
    transaction_uuid = str(uuid.uuid4())
    
    # Create pending payment
    payment = Payment.objects.create(
        buyer=user,
        plan=plan,
        amount=plan.price,
        gateway=gateway,
        transaction_id=transaction_uuid,
        status='PENDING'
    )
    
    if gateway == 'ES': #only esewa used rn
        # eSewa v2 parameters
        # For Sandbox:
        secret_key = "8gBm/:&EnhH.1/q"
        product_code = "EPAYTEST"
        
        # message = "total_amount,transaction_uuid,product_code"
        # Ensure total_amount is formatted correctly (no trailing zeros ideally, but let's see)
        total_amount = str(int(plan.price)) # Assuming integer prices for now, or use format
        
        message = f"total_amount={plan.price},transaction_uuid={transaction_uuid},product_code={product_code}"
        
        # Generate HMAC-SHA256 signature
        key = bytes(secret_key, 'utf-8')
        message_bytes = bytes(message, 'utf-8')
        hash_obj = hmac.new(key, message_bytes, hashlib.sha256)
        signature = base64.b64encode(hash_obj.digest()).decode('utf-8')
        
        return Response({
            "amount": str(plan.price),
            "tax_amount": "0",
            "total_amount": str(plan.price),
            "transaction_uuid": transaction_uuid,
            "product_code": product_code,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": request.build_absolute_uri('/api/webhook/esewa/'),
            "failure_url": request.build_absolute_uri('/payment-failure/'),
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
            "esewa_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        }, status=200)

    return Response({"error": "Gateway not supported"}, status=400) 
    #just in case other gateways are used eg: khalti

@api_view(['GET', 'POST']) # eSewa redirects with GET
def esewa_hook(request):
    """
    Handles eSewa success redirect and verifies payment
    """
    # eSewa v2 sends encoded response in 'data' parameter
    data = request.GET.get('data')
    if not data:
        return Response({"error": "No data received"}, status=400)
    
    # Decode base64 data
    decoded_data = json.loads(base64.b64decode(data).decode('utf-8'))
    
    transaction_uuid = decoded_data.get('transaction_uuid')
    status = decoded_data.get('status')
    
    payment = get_object_or_404(Payment, transaction_id=transaction_uuid)
    
    if status == 'COMPLETE':
        payment.status = 'COMPLETED'
        payment.save()
        
        # Active subscription
        plan = payment.plan
        buyer = payment.buyer
        
        # Calculate end_date (e.g., 30 days)
        end_date = timezone.now() + timedelta(days=30)
        
        UserSubscription.objects.update_or_create(
            buyer=buyer,
            plan=plan,
            defaults={'is_active': True, 'end_date': end_date}
        )
        
        # Redirect to success page (template view)
        return redirect('success')
        
    return redirect('landing')


@api_view(['GET'])
def get_payment(request, id):
    payment = get_object_or_404(Payment, id=id)
    return Response(PaymentSerializer(payment).data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def linkdiscord(request):
    creator = get_object_or_404(UserProfile, user=request.user)

    if not creator.is_creator:
        return Response({"error": "not authorized"}, status=403)

    plan_id = request.data.get("plan_id")
    if not plan_id:
        return Response({"error": "plan_id is required"}, status=400)

    plan = get_object_or_404(
        SubscriptionPlan,
        id=plan_id,
        creator=creator
    )

    serializer = DiscordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(plan=plan)

    return Response(serializer.data, status=201) 

@api_view(['POST'])
def syncdiscord(request):
    ...

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unlinkdiscord(request):
    """
    Unlinks Discord from a creator's plan
    """
    creator = get_object_or_404(UserProfile, user=request.user)
    if not creator.is_creator:
        return Response({"error": "not authorized"}, status=403)

    plan = get_object_or_404(SubscriptionPlan, creator=creator)
    if hasattr(plan, 'discord'):
        plan.discord.delete()
        return Response({"message": "Discord unlinked successfully"}, status=200)
    return Response({"error": "No discord integration found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def linkwhatsapp(request):
    """
    Links WhatsApp group to a creator's plan
    """
    creator = get_object_or_404(UserProfile, user=request.user)

    if not creator.is_creator:
        return Response({"error": "not authorized"}, status=403)

    plan_id = request.data.get("plan_id")
    if not plan_id:
        return Response({"error": "plan_id is required"}, status=400)

    plan = get_object_or_404(
        SubscriptionPlan,
        id=plan_id,
        creator=creator
    )

    serializer = WhatsAppSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(plan=plan)

    return Response(serializer.data, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unlinkwhatsapp(request):
    """
    Unlinks WhatsApp from a creator's plan
    """
    creator = get_object_or_404(UserProfile, user=request.user)
    if not creator.is_creator:
        return Response({"error": "not authorized"}, status=403)

    plan = get_object_or_404(SubscriptionPlan, creator=creator)
    if hasattr(plan, 'whatsapp'):
        plan.whatsapp.delete()
        return Response({"message": "WhatsApp unlinked successfully"}, status=200)
    return Response({"error": "No whatsapp integration found"}, status=404)

