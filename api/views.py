from rest_framework.response import Response 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from guff.models import UserProfile, SubscriptionPlan, UserSubscription
from django.contrib.auth.models import User
from .serializers import ProfileSerializer, DiscordSerializer, WhatsAppSerializer
from django.shortcuts import get_object_or_404
from .subscription_serializers import UserSubSerializer, PlanSerializer, PaymentSerializer 

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

    serializer = PlanSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)  
    serializer.save(creator=creator_profile)
    return Response(serializer.data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def plan_details(request, plan_id):
    """
    returns details of specified plan
    
    :param plan_id: id of plan to be searched
    """
    plan = get_object_or_404(SubscriptionPlan, id=plan_id)
    return Response(PlanSerializer(plan).data, status=200)

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
def initiate_payment(request):
    ...

@api_view(['POST'])
def verify_payment(request):
    ...

@api_view(['GET'])
def get_payment(request, id):
    ...

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

@api_view(['UPDATE'])
def unlinkdiscord(request):
    ...

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

@api_view(['UPDATE'])
def unlinkwhatsapp(request):
    ...

@api_view(['GET'])
def getinvite(request, subscription_id):
    ...

@api_view(['POST'])
def esewa_hook(request):
    ...

@api_view(['POST'])
def khalti_hook(request):
    ...
