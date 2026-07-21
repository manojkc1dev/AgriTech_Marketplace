from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    ORDER = 'ORDER', 'Order Update'
    NEGOTIATION = 'NEGOTIATION', 'Negotiation/Counter-Offer'
    PAYMENT = 'PAYMENT', 'Payment Status'
    LOGISTICS = 'LOGISTICS', 'Logistics/Dispatch'
    SYSTEM = 'SYSTEM', 'System Alert'


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.title} ({'Read' if self.is_read else 'Unread'})"