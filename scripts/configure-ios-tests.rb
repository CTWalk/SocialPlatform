#!/usr/bin/env ruby
require 'fileutils'
require 'xcodeproj'

root = File.expand_path('..', __dir__)
project_path = File.join(root, 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'App' }

abort('App target not found in iOS project') unless app_target

FileUtils.mkdir_p(File.join(root, 'ios', 'App', 'AppTests'))
FileUtils.mkdir_p(File.join(root, 'ios', 'App', 'AppUITests'))

tests_group = project.main_group.find_subpath('AppTests', true)
ui_tests_group = project.main_group.find_subpath('AppUITests', true)

def ensure_target(project, app_target, name, type, bundle_id)
  target = project.targets.find { |item| item.name == name }
  target ||= project.new_target(type, name, :ios, '15.0')

  unless target.dependencies.map(&:target).include?(app_target)
    target.add_dependency(app_target)
  end

  target.build_configurations.each do |config|
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle_id
    config.build_settings['SWIFT_VERSION'] = '5.0'
    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
    config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
    config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
    config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@loader_path/Frameworks']

    if type == :unit_test_bundle
      config.build_settings['TEST_HOST'] = '$(BUILT_PRODUCTS_DIR)/App.app/App'
      config.build_settings['BUNDLE_LOADER'] = '$(TEST_HOST)'
    else
      config.build_settings['TEST_TARGET_NAME'] = 'App'
    end
  end

  target
end

def ensure_source_file(target, group, filename)
  ref = group.files.find { |file| file.path == filename } || group.new_file(filename)
  return if target.source_build_phase.files_references.include?(ref)

  target.source_build_phase.add_file_reference(ref, true)
end

unit_target = ensure_target(project, app_target, 'AppTests', :unit_test_bundle, 'com.company.socialplatform.tests')
ui_target = ensure_target(project, app_target, 'AppUITests', :ui_test_bundle, 'com.company.socialplatform.uitests')

ensure_source_file(unit_target, tests_group, 'AppTests.swift')
ensure_source_file(ui_target, ui_tests_group, 'AppUITests.swift')
ensure_source_file(ui_target, ui_tests_group, 'AppUITestsLaunchTests.swift')

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app_target)
scheme.add_build_target(unit_target, false)
scheme.add_build_target(ui_target, false)
scheme.set_launch_target(app_target)
scheme.add_test_target(unit_target)
scheme.add_test_target(ui_target)
scheme.save_as(project_path, 'App', true)

project.save
