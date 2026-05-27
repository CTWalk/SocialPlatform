import XCTest

final class AppUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testMemberFlowShowsBottomTabs() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-UITEST_MODE"]
        app.launch()

        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 20))
        loginButton.tap()

        XCTAssertTrue(app.buttons["Comment Board"].waitForExistence(timeout: 20))
        XCTAssertTrue(app.buttons["Search posts"].waitForExistence(timeout: 20) || app.buttons["Search"].waitForExistence(timeout: 20))
        XCTAssertTrue(app.buttons["Profile"].waitForExistence(timeout: 20))
    }
}
