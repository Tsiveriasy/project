from django.contrib import admin
from .models import Question, Option, TestResult, FieldRecommendation

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'order')
    inlines = [OptionInline]

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'question')

class FieldRecommendationInline(admin.TabularInline):
    model = FieldRecommendation
    extra = 3

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_taken')
    inlines = [FieldRecommendationInline]

@admin.register(FieldRecommendation)
class FieldRecommendationAdmin(admin.ModelAdmin):
    list_display = ('test_result', 'field', 'compatibility')