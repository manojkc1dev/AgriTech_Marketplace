from django.db import models


class RegionCategory(models.TextChoices):
    KATHMANDU = 'Kathmandu', 'Kathmandu'
    TERAI = 'Terai', 'Terai'
    HILL = 'Hill', 'Hill'
    MOUNTAIN = 'Mountain', 'Mountain'


class MarketOrigin(models.Model):
    name = models.CharField(max_length=150, unique=True)  # e.g., Kalimati Market, Tokha Sub-Market
    region = models.CharField(max_length=50, choices=RegionCategory.choices, default=RegionCategory.KATHMANDU)
    district = models.CharField(max_length=100, default='Kathmandu')

    def __str__(self):
        return f"{self.name} ({self.region})"


class DailyMarketPrice(models.Model):
    crop_name = models.CharField(max_length=150)  # e.g., "Potato (Alu)", "Tomato (Golbheda)"
    market_origin = models.ForeignKey(MarketOrigin, on_delete=models.CASCADE, related_name='price_logs')
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)  # NRs / KG
    weekly_trend_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # e.g. -5.40, +6.80
    date_registered = models.DateField()

    class Meta:
        ordering = ['-date_registered', 'crop_name']
        unique_together = ['crop_name', 'market_origin', 'date_registered']

    def __str__(self):
        return f"{self.crop_name} @ {self.market_origin.name} - NRs. {self.daily_rate}/KG ({self.date_registered})"