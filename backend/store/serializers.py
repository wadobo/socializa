from rest_framework import serializers


class ProductSerializer(serializers.Serializer):
    product_id = serializers.CharField()
