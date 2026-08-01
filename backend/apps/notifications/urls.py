from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationReadView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification_list"),
    path(
        "read-all/",
        MarkNotificationReadView.as_view(),
        name="notification_mark_all_read",
    ),  # Must be above <int:pk>
    path(
        "<int:pk>/read/",
        MarkNotificationReadView.as_view(),
        name="notification_mark_read",
    ),
]