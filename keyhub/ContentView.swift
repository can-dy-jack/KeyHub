//
//  ContentView.swift
//  keyhub
//
//  Created by 陈科衡 on 2026/5/29.
//

import SwiftUI
import AppKit

struct ContentView: View {
    @State private var selectedGroupID: String?
    @State private var selectedKeyID: String?

    private let groups: [HubGroup] = HubGroup.samples
    private let keys: [APIKeyItem] = APIKeyItem.samples

    private var filteredKeys: [APIKeyItem] {
        guard let selectedGroupID else { return keys }
        return keys.filter { $0.groupID == selectedGroupID }
    }

    private var selectedKey: APIKeyItem? {
        guard let selectedKeyID else { return nil }
        return keys.first(where: { $0.id == selectedKeyID })
    }

    var body: some View {
        NavigationSplitView {
            List(selection: $selectedGroupID) {
                OutlineGroup(groups, children: \.children) { group in
                    Label(group.name, systemImage: "folder")
                        .tag(group.id)
                }
            }
            .navigationTitle("Groups")
        } content: {
            List(selection: $selectedKeyID) {
                ForEach(filteredKeys) { item in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.name)
                            .font(.headline)
                        Text("\(item.provider) · \(item.baseURL)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .tag(item.id)
                }
            }
            .navigationTitle("Keys")
        } detail: {
            if let selectedKey {
                KeyDetailView(item: selectedKey)
            } else {
                ContentUnavailableView(
                    "Select a key",
                    systemImage: "key.horizontal",
                    description: Text("Start by choosing a group and key.")
                )
            }
        }
        .frame(minWidth: 1000, minHeight: 620)
    }
}

private struct KeyDetailView: View {
    let item: APIKeyItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(item.name)
                    .font(.title2)
                    .fontWeight(.semibold)

                GroupBox("Basic") {
                    Grid(alignment: .leading, horizontalSpacing: 12, verticalSpacing: 8) {
                        GridRow {
                            Text("Provider")
                                .foregroundStyle(.secondary)
                            Text(item.provider)
                        }
                        GridRow {
                            Text("Base URL")
                                .foregroundStyle(.secondary)
                            Text(item.baseURL)
                        }
                        GridRow {
                            Text("Status")
                                .foregroundStyle(.secondary)
                            Text(item.status.rawValue)
                        }
                        GridRow {
                            Text("Expires")
                                .foregroundStyle(.secondary)
                            Text(item.expiresAt)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                GroupBox("Models") {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(item.models, id: \.self) { model in
                            Text("• \(model)")
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                GroupBox("Actions") {
                    HStack(spacing: 12) {
                        Button("Open settings.json") {
                            SettingsPath.openSettingsFile()
                        }

                        Button("Manual usage refresh") {
                            // Placeholder for Phase E implementation.
                        }

                        Button("Connectivity test") {
                            // Placeholder for Phase D implementation.
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(20)
        }
        .navigationTitle("Detail")
    }
}

private enum SettingsPath {
    static let file: String = {
        let base = ("~/.config/keyhub" as NSString).expandingTildeInPath
        return (base as NSString).appendingPathComponent("settings.json")
    }()

    static func openSettingsFile() {
        let url = URL(fileURLWithPath: file)
        NSWorkspace.shared.open(url)
    }
}

private struct HubGroup: Identifiable, Hashable {
    let id: String
    let name: String
    let children: [HubGroup]?

    static let samples: [HubGroup] = [
        HubGroup(
            id: "openai",
            name: "OpenAI",
            children: [
                HubGroup(id: "openai-prod", name: "Production", children: nil),
                HubGroup(id: "openai-dev", name: "Development", children: nil)
            ]
        ),
        HubGroup(id: "anthropic", name: "Anthropic", children: nil),
        HubGroup(id: "openrouter", name: "OpenRouter", children: nil)
    ]
}

private struct APIKeyItem: Identifiable {
    enum Status: String {
        case active
        case warning
        case expired
    }

    let id: String
    let groupID: String
    let name: String
    let provider: String
    let baseURL: String
    let models: [String]
    let status: Status
    let expiresAt: String

    static let samples: [APIKeyItem] = [
        APIKeyItem(
            id: "k-openai-prod-1",
            groupID: "openai-prod",
            name: "OpenAI Prod Key 1",
            provider: "openai",
            baseURL: "https://api.openai.com/v1",
            models: ["gpt-4.1", "gpt-4o-mini"],
            status: .active,
            expiresAt: "2026-12-31"
        ),
        APIKeyItem(
            id: "k-openai-dev-1",
            groupID: "openai-dev",
            name: "OpenAI Dev Key",
            provider: "openai",
            baseURL: "https://api.openai.com/v1",
            models: ["gpt-4o-mini"],
            status: .warning,
            expiresAt: "2026-06-10"
        ),
        APIKeyItem(
            id: "k-anthropic-main",
            groupID: "anthropic",
            name: "Anthropic Main",
            provider: "anthropic",
            baseURL: "https://api.anthropic.com",
            models: ["claude-3-7-sonnet"],
            status: .active,
            expiresAt: "2026-11-30"
        )
    ]
}

#Preview {
    ContentView()
}
