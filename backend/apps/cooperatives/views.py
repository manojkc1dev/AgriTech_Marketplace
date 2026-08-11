from rest_framework import viewsets, permissions
from .models import Cooperative, Announcement, Message
from .permission import IsPlatformAdminOrReadOnly, IsCooperativeAdminOrOwner
from rest_framework.serializers import ModelSerializer


# --- Serializers (Keep them close or in a separate serializers.py file) ---
class CooperativeSerializer(ModelSerializer):
    class Meta:
        model = Cooperative
        fields = '__all__'


class AnnouncementSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'created_at']


# --- ViewSets ---
class CooperativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows cooperatives to be viewed or edited.
    """
    queryset = Cooperative.objects.all().order_by('-created_at')
    serializer_class = CooperativeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsPlatformAdminOrReadOnly]


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    API endpoint for cooperative announcements. 
    Cooperatives can only create/edit announcements for their own organization.
    """
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCooperativeAdminOrOwner]

    def get_queryset(self):
        # Optional: Allow filtering by cooperative via query params (?cooperative=1)
        queryset = super().get_queryset()
        coop_id = self.request.query_params.get('cooperative')
        if coop_id:
            queryset = queryset.filter(cooperative_id=coop_id)
        return queryset

    def perform_create(self, serializer):
        # Automatically attach the requesting user as the creator
        serializer.save(created_by=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for messages inside a cooperative context.
    """
    queryset = Message.objects.all().order_by('-created_at')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCooperativeAdminOrOwner]

    def get_queryset(self):
        queryset = super().get_queryset()
        coop_id = self.request.query_params.get('cooperative')
        if coop_id:
            queryset = queryset.filter(cooperative_id=coop_id)
        return queryset

    def perform_create(self, serializer):
        # Automatically attach the sender as the current user
        serializer.save(sender=self.request.user)