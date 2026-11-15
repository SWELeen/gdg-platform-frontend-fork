import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loginRedirect } from '../lib/auth/proxy-routing.ts';

test('protected localized pages preserve a safe same-site return path', () => {
  assert.equal(loginRedirect('/ar/dashboard/members-dashboard', '?tab=events', false), '/ar/login?returnTo=%2Fdashboard%2Fmembers-dashboard%3Ftab%3Devents');
  assert.equal(loginRedirect('/en/profile', '', false), '/en/login?returnTo=%2Fprofile');
});
test('cookie hints avoid navigation redirects but confer no permissions', () => {
  assert.equal(loginRedirect('/en/dashboard', '', true), null);
});
test('public pages, auth callbacks and similar prefixes remain accessible', () => {
  for (const path of ['/en/login', '/ar/signup', '/en/auth/callback', '/ar/verify-email', '/en/profile-public', '/api/auth/get-session', '/en/events']) assert.equal(loginRedirect(path, '', false), null);
});
