import XCTest

final class AppUITestsLaunchTests: XCTestCase {
    override class var runsForEachTargetApplicationUIConfiguration: Bool {
        true
    }

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testLaunchSnapshot() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-UITEST_MODE"]
        app.launch()

        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = "ios-launch-screen"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
