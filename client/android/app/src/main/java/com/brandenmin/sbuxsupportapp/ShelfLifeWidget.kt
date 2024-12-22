package com.brandenmin.sbuxsupportapp

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.*

class ShelfLifeWidget : AppWidgetProvider() {

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
        updateWidgetSize(context, appWidgetManager, appWidgetId, newOptions)
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            updateWidgetSize(context, appWidgetManager, appWidgetId, options)
        }
    }

    private fun updateWidgetSize(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        options: Bundle
    ) {
        val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
        val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)

        val cellWidth = (minWidth + 30) / 110
        val cellHeight = (minHeight + 30) / 110
        val isSmall = cellWidth < 3 && cellHeight <= 2

        updateAppWidget(context, appWidgetManager, appWidgetId, isSmall)
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
            isSmall: Boolean
        ) {
            val views = if (isSmall) {
                RemoteViews(context.packageName, R.layout.shelf_life_widget_small)
            } else {
                RemoteViews(context.packageName, R.layout.shelf_life_widget_medium)
            }

            val dateFormat = SimpleDateFormat("E, MMM d", Locale.getDefault())

            val expiryDates = listOf(
                "2d" to Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 2) },
                "3d" to Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 3) },
                "5d" to Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 5) },
                "7d" to Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 7) },
                "14d" to Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 14) }
            ).map { (label, date) -> label to dateFormat.format(date.time) }

            if (isSmall) {
                views.setTextViewText(R.id.widgetTitle, " Shelf Life")
                views.setTextViewText(R.id.widgetDate1Label, expiryDates[0].first)
                views.setTextViewText(R.id.widgetDate1Result, expiryDates[0].second)
                views.setTextViewText(R.id.widgetDate2Label, expiryDates[1].first)
                views.setTextViewText(R.id.widgetDate2Result, expiryDates[1].second)
                views.setTextViewText(R.id.widgetDate3Label, expiryDates[2].first)
                views.setTextViewText(R.id.widgetDate3Result, expiryDates[2].second)
            } else {
                views.setTextViewText(R.id.widgetTitle, " Shelf Life Dates")
                views.setTextViewText(R.id.widgetDate1Label, expiryDates[0].first)
                views.setTextViewText(R.id.widgetDate1Result, expiryDates[0].second)
                views.setTextViewText(R.id.widgetDate2Label, expiryDates[1].first)
                views.setTextViewText(R.id.widgetDate2Result, expiryDates[1].second)
                views.setTextViewText(R.id.widgetDate3Label, expiryDates[2].first)
                views.setTextViewText(R.id.widgetDate3Result, expiryDates[2].second)
                views.setTextViewText(R.id.widgetDate4Label, expiryDates[3].first)
                views.setTextViewText(R.id.widgetDate4Result, expiryDates[3].second)
                views.setTextViewText(R.id.widgetDate5Label, expiryDates[4].first)
                views.setTextViewText(R.id.widgetDate5Result, expiryDates[4].second)
            }

            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widgetTitle, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
