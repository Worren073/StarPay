from rest_framework import serializers
from .models import Athlete, AthleteProgress, Plan, AthletePlan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class AthletePlanSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_price = serializers.DecimalField(source='plan.price', max_digits=10, decimal_places=2, read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = AthletePlan
        fields = ('id', 'athlete', 'plan', 'plan_name', 'plan_price', 'start_date', 'end_date',
                  'auto_renew', 'days_remaining', 'duration_days', 'progress_percentage', 'status', 'created_at')


class AthleteSerializer(serializers.ModelSerializer):
    coach_names = serializers.SerializerMethodField()
    plan_status = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Athlete
        fields = '__all__'

    def get_coach_names(self, obj):
        return [c.name for c in obj.coaches.all()]

    def get_plan_status(self, obj):
        from .models import AthletePlan
        try:
            p = obj.athlete_plan
            if p.days_remaining <= 0:
                return 'expired'
            if p.days_remaining <= 7:
                return 'expiring'
            return 'active'
        except AthletePlan.DoesNotExist:
            return None

    def get_days_remaining(self, obj):
        from .models import AthletePlan
        try:
            return obj.athlete_plan.days_remaining
        except AthletePlan.DoesNotExist:
            return None

    def validate_speed_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value

    def validate_technique_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value

    def validate_form_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value


class AthleteProgressSerializer(serializers.ModelSerializer):
    athlete = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AthleteProgress
        fields = '__all__'
        read_only_fields = ('recorded_at',)

    def validate_speed_score(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value

    def validate_technique_score(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value

    def validate_form_score(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value


class AthleteProfileSerializer(serializers.ModelSerializer):
    coach_names = serializers.SerializerMethodField()
    coach_specialties = serializers.SerializerMethodField()

    class Meta:
        model = Athlete
        fields = ('id', 'name', 'age', 'level', 'category', 'status',
                  'speed_score', 'technique_score', 'form_score',
                  'coaches', 'coach_names', 'coach_specialties')

    def get_coach_names(self, obj):
        return [c.name for c in obj.coaches.all()]

    def get_coach_specialties(self, obj):
        return [c.specialty for c in obj.coaches.all()]
