//
//  StaticWidget.swift
//  sbuxsupportapp
//
//  Created by Branden on 12/23/24.
//

import WidgetKit
import SwiftUI

struct ShelfLifeStaticWidget: Widget {
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
