from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """GET: Fetch notifications for logged-in user"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkNotificationReadView(APIView):
    """PATCH: Mark a specific notification or all notifications as read"""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk=None):
        if pk:
            try:
                notification = Notification.objects.get(
                    id=pk, user=request.user
                )
                notification.is_read = True
                notification.save()
                return Response(
                    NotificationSerializer(notification).data,
                    status=status.HTTP_200_OK,
                )
            except Notification.DoesNotExist:
                return Response(
                    {"error": "Notification not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Mark all as read
            Notification.objects.filter(
                user=request.user, is_read=False
            ).update(is_read=True)
            return Response(
                {"message": "All notifications marked as read."},
                status=status.HTTP_200_OK,
            )


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        user_notifications = self.get_queryset().filter(is_read=False)
        user_notifications.update(is_read=True)
        return Response(
            {"status": "All notifications marked as read"},
            status=status.HTTP_200_OK,
        )