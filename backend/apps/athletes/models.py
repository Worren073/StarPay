from django.db import models


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
    speed_score = models.PositiveIntegerField(default=0)
    technique_score = models.PositiveIntegerField(default=0)
    form_score = models.PositiveIntegerField(default=0)
    coach = models.ForeignKey('staff.StaffMember', on_delete=models.SET_NULL, null=True, blank=True, related_name='athletes')
    user = models.OneToOneField('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.level})"
