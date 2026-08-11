from rest_framework import serializers
from apps.products.models import Category, Product, ProductImage, ProductStatus
from apps.products.validators import validate_product_image


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(validators=[validate_product_image])

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'category_name', 'seller_email',
            'price_per_unit', 'quantity_available', 'unit', 'status',
            'location_district', 'location_city', 'primary_image', 'created_at'
        ]

    def get_primary_image(self, obj) -> str | None:
        first_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if first_img and hasattr(first_img.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_img.image.url)
            return first_img.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    seller_info = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'seller_info',
            'price_per_unit', 'quantity_available', 'unit', 'status',
            'location_district', 'location_city', 'images', 'created_at', 'updated_at'
        ]

    def get_seller_info(self, obj) -> dict:
        return {
            "id": str(obj.seller.id),
            "email": obj.seller.email,
            "role": obj.seller.role,
            "phone_number": obj.seller.phone_number
        }


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'category', 'title', 'description', 'price_per_unit',
            'quantity_available', 'unit', 'status', 'location_district', 'location_city'
        ]

    def validate_price_per_unit(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price per unit must be strictly greater than zero.")
        return value

    def validate_quantity_available(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity available cannot be negative.")
        return value
    