package com.company.socialplatform;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.web.assertion.WebViewAssertions.webMatches;
import static androidx.test.espresso.web.model.Atoms.findElement;
import static androidx.test.espresso.web.model.Atoms.getText;
import static androidx.test.espresso.web.sugar.Web.onWebView;
import static org.hamcrest.Matchers.containsString;

import android.content.Intent;
import android.webkit.WebView;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.web.webdriver.Locator;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class MainActivityInstrumentedTest {

    private void launchApp() {
        Intent intent = ApplicationProvider.getApplicationContext()
            .getPackageManager()
            .getLaunchIntentForPackage("com.company.socialplatform");

        if (intent == null) {
            throw new IllegalStateException("Launch intent not found for com.company.socialplatform");
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        InstrumentationRegistry.getInstrumentation().startActivitySync(intent);
        InstrumentationRegistry.getInstrumentation().waitForIdleSync();
    }

    @Test
    public void launchesMainWebView() {
        launchApp();
        onView(withId(R.id.main_web_view)).check(matches(isDisplayed()));
    }

    @Test
    public void memberFlowShowsBottomTabs() {
        launchApp();
        onView(withId(R.id.main_web_view)).perform(click());
        onWebView(withId(R.id.main_web_view))
            .withElement(findElement(Locator.XPATH, "//button[contains(., 'Login')]"))
            .perform(androidx.test.espresso.web.model.Atoms.webClick());

        onWebView(withId(R.id.main_web_view))
            .withElement(findElement(Locator.CSS_SELECTOR, "[data-testid='mobile-navigation']"))
            .check(webMatches(getText(), containsString("Comment Board")));

        onWebView(withId(R.id.main_web_view))
            .withElement(findElement(Locator.CSS_SELECTOR, "[data-testid='tab-search-mobile']"))
            .check(webMatches(getText(), containsString("Search")));
    }
}
