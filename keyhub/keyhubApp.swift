//
//  keyhubApp.swift
//  keyhub
//
//  Created by 陈科衡 on 2026/5/29.
//

import SwiftUI
import Foundation

@main
struct keyhubApp: App {
        init() {
                SettingsBootstrap.ensureConfigExists()
        }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

private enum SettingsBootstrap {
        static func ensureConfigExists() {
                let fm = FileManager.default
                let directory = ("~/.config/keyhub" as NSString).expandingTildeInPath
                let settingsPath = (directory as NSString).appendingPathComponent("settings.json")

                do {
                        try fm.createDirectory(atPath: directory, withIntermediateDirectories: true)

                        guard !fm.fileExists(atPath: settingsPath) else {
                                return
                        }

                        try defaultSettings().write(toFile: settingsPath, atomically: true, encoding: .utf8)
                } catch {
                        NSLog("[KeyHub] Failed to bootstrap settings file: %@", error.localizedDescription)
                }
        }

        static func defaultSettings() -> String {
                return """
                {
                    "_meta": {
                        "schemaVersion": "1.0.0",
                        "createdAt": "2026-05-29T00:00:00Z",
                        "updatedAt": "2026-05-29T00:00:00Z",
                        "editSequence": 1
                    },
                    "preferences": {
                        "theme": "system",
                        "showExpiryDaysWarning": 7,
                        "autoRefreshUsage": false,
                        "keyStorageMode": "plaintext"
                    },
                    "groups": [
                        {
                            "id": "openai",
                            "name": "OpenAI",
                            "children": [
                                {
                                    "id": "openai-prod",
                                    "name": "Production",
                                    "children": []
                                }
                            ],
                            "items": []
                        }
                    ],
                    "usageCache": {},
                    "audit": {
                        "lastValidationAt": null,
                        "lastValidationError": null
                    }
                }
                """
        }
}
