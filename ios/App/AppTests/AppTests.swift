import XCTest

final class AppTests: XCTestCase {
    func testUnitBundleLoads() {
        XCTAssertTrue(Bundle(for: Self.self).bundleURL.pathExtension == "xctest")
    }
}
