import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  generationCard: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  settingsCard: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  settingsRow: {
    flexDirection: "row",
  },
  settingsColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputWithButtonContainer: {
    position: "relative",
    flex: 1,
    zIndex: 9999,
    elevation: 10,
  },
  hintsDropdownWrapper: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 50,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    height: 48,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: "#fff",
    color: "#333",
  },
  passwordOutput: {
    backgroundColor: "#f9f9f9",
    color: "#333",
    fontWeight: "600",
  },
  bumpButton: {
    position: "absolute",
    right: 0,
    height: 48,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  bumpButtonInner: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  bumpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    position: "absolute",
    right: 0,
    height: 48,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 4,
  },
  toggleButtonInner: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 20,
  },
  generateButtonFull: {
    height: 48,
    width: "100%",
  },
  statusBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  saveButtonTextStyle: {
    color: "#fff",
    fontSize: 16,
  },
});
