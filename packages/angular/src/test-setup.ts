import '@angular/compiler'
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core'
import { getTestBed } from '@angular/core/testing'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing'

// Run the TestBed zoneless: no `zone.js/testing`, so Vitest's runner doesn't need the
// Jasmine-style ProxyZone hooks. `fixture.detectChanges()` drives change detection directly.
@NgModule({ providers: [provideExperimentalZonelessChangeDetection()] })
class ZonelessTestModule {}

getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, ZonelessTestModule],
  platformBrowserDynamicTesting(),
)
