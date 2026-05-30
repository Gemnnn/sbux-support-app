//
//  ShelfLifeWidgetBundle.swift
//  ShelfLifeWidget
//
//  Created by Sol on 8/20/25.
//

import WidgetKit
import SwiftUI

@main
struct ShelfLifeWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        ShelfLifeWidget()
    }
}
