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
    let labelsAndDays = [("2d", 2), ("3d", 3), ("5d", 5), ("7d", 7), ("14d", 14)]
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
  var entry: ShelfLifeEntry

  var body: some View {
    switch widgetFamily {
    case .systemSmall:
      SmallWidgetView(entry: entry)
        .applyBackground()
    case .systemMedium:
      MediumWidgetView(entry: entry)
        .applyBackground()
    default:
      MediumWidgetView(entry: entry)
        .applyBackground()
    }
  }
}

extension View {
  @ViewBuilder
  func applyBackground() -> some View {
    if #available(iOS 17.0, *) {
      self.containerBackground(for: .widget) { Color(red: 30/255, green: 57/255, blue: 50/255) }
    } else {
      self.background(Color(red: 30/255, green: 57/255, blue: 50/255))
    }
  }
}

var GreenColor: Color {
    Color(red: 30/255, green: 57/255, blue: 50/255)
}

var lightBrownColor: Color {
    Color(red: 186/255, green: 140/255, blue: 99/255)
}

var creamWhiteColor: Color {
    Color(red: 245/255, green: 240/255, blue: 225/255)
}

var whiteColor: Color {
    Color.white
}

struct SmallWidgetView: View {
    var entry: ShelfLifeEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "cup.and.saucer.fill")
                    .foregroundColor(creamWhiteColor)
                    .font(.system(size: 15))
                Text("Shelf Life")
                    .font(.system(size: 13))
                    .bold()
                    .foregroundColor(lightBrownColor)
            }
            .padding(.bottom, 2)
            ForEach(entry.expiryDates.prefix(3)) { expiry in
                HStack {
                    Text(expiry.label)
                        .font(.body)
                        .foregroundColor(lightBrownColor)
                    Spacer()
                    Text(expiry.formattedDate)
                        .font(.system(size: 15))
                        .foregroundColor(whiteColor)
                }
                .padding(.vertical, 3)
                .padding(.horizontal, 1)
                .background(Color.black.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding(.horizontal, 1)
        .padding(.vertical, 3)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct MediumWidgetView: View {
    var entry: ShelfLifeEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "cup.and.saucer.fill")
                    .foregroundColor(creamWhiteColor)
                    .font(.system(size: 20))
                Text("Shelf Life Dates")
                    .font(.system(size: 15))
                    .bold()
                    .foregroundColor(lightBrownColor)
            }
            .padding(.bottom, 4)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(entry.expiryDates.prefix(3)) { expiry in
                        HStack {
                            Text(expiry.label)
                                .font(.body)
                                .foregroundColor(lightBrownColor)
                            Spacer()
                            Text(expiry.formattedDate)
                                .font(.system(size: 16))
                                .bold()
                                .foregroundColor(whiteColor)
                        }
                        .padding(.vertical, 3)
                        .padding(.horizontal, 2)
                        .background(Color.black.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                Spacer()
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(entry.expiryDates[3..<5]) { expiry in
                        HStack {
                            Text(expiry.label)
                                .font(.body)
                                .foregroundColor(lightBrownColor)
                            Spacer()
                            Text(expiry.formattedDate)
                                .font(.system(size: 17))
                                .bold()
                                .foregroundColor(whiteColor)
                        }
                        .padding(.vertical, 3)
                        .padding(.horizontal, 2)
                        .background(Color.black.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }
        }
        .padding(3)
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
