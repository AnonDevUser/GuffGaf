from django.shortcuts import render
from django.http import JsonResponse
from django.utils.html import strip_tags
from .db import waitlist_collection
# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def join(request):
    if request.method == "POST":
        name = strip_tags(request.POST.get("name"))
        email = strip_tags(request.POST.get("email"))
        email_exists = waitlist_collection.find_one({"email":email})
        if not email_exists:
            try:
                data = waitlist_collection.insert_one({'name':name, 'email':email}) 
                return JsonResponse({'status':'success'})
            except:
                return JsonResponse({'status':'error'})
        else:
            return JsonResponse({'status':'error', 'message':'Email already exists'})
    else:
        return render(request, "guff/main.html")

    