from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from datetime import date


class Plan(models.Model):
    name = models.CharField(max_length=100, default="Plan Mensual")
    duration_days = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('25.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (${self.price} / {self.duration_days}d)"


class AthletePlan(models.Model):
    athlete = models.OneToOneField('athletes.Athlete', on_delete=models.CASCADE, related_name='athlete_plan')
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def days_remaining(self):
        delta = self.end_date - date.today()
        return max(0, delta.days)

    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days

    @property
    def progress_percentage(self):
        total = self.duration_days
        if total <= 0:
            return 0
        elapsed = total - self.days_remaining
        return min(100, round((elapsed / total) * 100))

    @property
    def status(self):
        if self.days_remaining <= 0:
            return 'expired'
        if self.days_remaining <= 7:
            return 'expiring'
        return 'active'

    def __str__(self):
        return f"{self.athlete.name} - {self.plan.name if self.plan else 'No plan'}"


class Athlete(models.Model):
    LEVEL_CHOICES = (
        ('elite', 'Elite'),
        ('pro', 'Pro'),
        ('beginner', 'Beginner'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    speed_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    technique_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    form_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    coaches = models.ManyToManyField('staff.StaffMember', blank=True, related_name='athletes')
    user = models.OneToOneField('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.level})"


class AthleteProgress(models.Model):
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='progress')
    speed_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    technique_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    form_score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']
        verbose_name_plural = 'Athlete progress'

    def __str__(self):
        return f"{self.athlete.name} - {self.recorded_at.date()}"
