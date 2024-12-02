import WidgetKit
import SwiftUI

struct ShelfLifeEntry: TimelineEntry {
    let date: Date
    let expiryDates: [ExpiryDate]
}

struct ExpiryDate: Identifiable {
    let id = UUID()
    let label: String
    let formattedDate: String
}

struct ShelfLifeProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShelfLifeEntry {
        ShelfLifeEntry(date: Date(), expiryDates: calculateExpiryDates())
    }

    func getSnapshot(in context: Context, completion: @escaping (ShelfLifeEntry) -> Void) {
        let entry = ShelfLifeEntry(date: Date(), expiryDates: calculateExpiryDates())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShelfLifeEntry>) -> Void) {
        let expiryDates = calculateExpiryDates()
        let currentDate = Date()
        let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate) ?? currentDate.addingTimeInterval(900)

        let entry = ShelfLifeEntry(date: currentDate, expiryDates: expiryDates)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
        completion(timeline)
    }
}

func calculateExpiryDates() -> [ExpiryDate] {
    let labelsAndDays = [("2D", 2), ("3D", 3), ("5D", 5), ("7D", 7), ("14D", 14)]
    let today = Date()
    let calendar = Calendar.current

    let dates = labelsAndDays.map { (label, daysToAdd) in
        if let futureDate = calendar.date(byAdding: .day, value: daysToAdd, to: today) {
            let formattedDate = formatDate(date: futureDate)
            return ExpiryDate(label: label, formattedDate: formattedDate)
        } else {
            return ExpiryDate(label: label, formattedDate: "Error")
        }
    }

    return dates
}

func formatDate(date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "E, MMM d"
    return formatter.string(from: date)
}

struct ShelfLifeWidgetEntryView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: ShelfLifeProvider.Entry

    var body: some View {
        switch widgetFamily {
        case .systemSmall:
            smallWidgetView
                .containerBackground(for: .widget) { starbucksGreenColor }
        case .systemMedium:
            mediumWidgetView
                .containerBackground(for: .widget) { starbucksGreenColor }
        default:
            mediumWidgetView
                .containerBackground(for: .widget) { starbucksGreenColor }
        }
    }

    var starbucksGreenColor: Color {
        Color(red: 30/255, green: 57/255, blue: 50/255)
    }

    var lightBrownColor: Color {
        Color(red: 186/255, green: 140/255, blue: 99/255)
    }

    var smallWidgetView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Shelf Life Dates")
                .font(.headline)
                .bold()
                .foregroundColor(.white)

            ForEach(entry.expiryDates.prefix(3)) { expiry in
                Text("\(expiry.label): \(expiry.formattedDate)")
                    .font(.caption)
                    .foregroundColor(.white)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    var mediumWidgetView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Shelf Life Dates")
                .font(.headline)
                .bold()
                .foregroundColor(.white)

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(entry.expiryDates.prefix(2)) { expiry in
                        Text("\(expiry.label): \(expiry.formattedDate)")
                            .font(.caption)
                            .foregroundColor(.white)
                    }
                }
                Spacer()
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(entry.expiryDates[2..<4]) { expiry in
                        Text("\(expiry.label): \(expiry.formattedDate)")
                            .font(.caption)
                            .foregroundColor(.white)
                    }
                }
            }

            HStack {
                Text("\(entry.expiryDates[4].label): \(entry.expiryDates[4].formattedDate)")
                    .font(.caption)
                    .foregroundColor(.white)
                Spacer()
                Button(action: {
                    // 버튼을 클릭하여 앱을 열도록 설정 (앱 URL 스키마 필요)
                }) {
                    Text("Search")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(4)
                        .background(lightBrownColor)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct ShelfLifeWidget: Widget {
    let kind: String = "ShelfLifeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ShelfLifeProvider()) { entry in
            ShelfLifeWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Shelf Life Tracker")
        .description("Track product expiry dates easily.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
