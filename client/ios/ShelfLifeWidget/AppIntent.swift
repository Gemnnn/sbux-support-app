//
//  AppIntent.swift
//  ShelfLifeWidget
//
//  Created by Branden on 11/24/24.
//

import WidgetKit
#if canImport(AppIntents)
import AppIntents
#endif

@available(iOS 18.0, *)
struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "This is an example widget." }

    @Parameter(title: "Favorite Emoji", default: "😃")
    var favoriteEmoji: String
}
