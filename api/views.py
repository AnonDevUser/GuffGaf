from rest_framework.response import Response 
from rest_framework.decorators import api_view
from serializers import ProfileSerializer, DiscordSerializer, WhatsAppSerializer
from subscription_serializers import UserSubSerializer, PlanSerializer, PaymentSerializer 

@api_view(['GET'])
def test(request):
    return Response({'res':'works'})

@api_view(['GET'])
def userprofile(request):
    return Response({'username':'yomama'})

@api_view(['GET'])
def getuser(request, username):
    ...

@api_view(['GET'])
def getplans(request, username):
    ...

@api_view(['POST'])
def plans(request):
    ...

@api_view(['GET'])
def plan_details(request, plan_id):
    ...

@api_view(['POST', 'GET'])
def subscriptions(request):
    ...

@api_view(['DELETE'])
def cancel_sub(requst, id):
    ...

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
def linkdiscord(request):
    ...

@api_view(['POST'])
def syncdiscord(request):
    ...

@api_view(['DELETE'])
def unlinkdiscord(request):
    ...

@api_view(['POST'])
def linkwhatsapp(request):
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
