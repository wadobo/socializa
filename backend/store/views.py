from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product
from .serializers import ProductSerializer


class GetProducts(APIView):

    def get(self, request):
        products = Product.objects.all().order_by('coins')
        serializer = ProductSerializer(products, many=True)
        data = serializer.data
        return Response(data)
