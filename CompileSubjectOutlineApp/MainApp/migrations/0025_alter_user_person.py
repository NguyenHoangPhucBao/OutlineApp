# Generated by Django 5.0.3 on 2024-05-31 23:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0024_alter_subjectoutline_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='person',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='MainApp.person'),
        ),
    ]
