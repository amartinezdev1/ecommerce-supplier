import test from 'node:test';import assert from 'node:assert/strict';
import {sameOrigin,safeReturnTo} from '../lib/server/config.mjs';
test('Redirecciones de acceso permanecen dentro de la tienda',()=>{for(const value of ['https://evil.example','//evil.example','/\\evil.example','/auth/signout','/acceso?x=1'])assert.equal(safeReturnTo(value),'/?cuenta=1');assert.equal(safeReturnTo('/?admin=1'),'/?admin=1');});
test('Mutaciones exigen origen exacto',()=>{const r=o=>new Request('https://rpm.example/api/quotes',{method:'POST',headers:o?{Origin:o}:{}});assert.throws(()=>sameOrigin(r()),/Origen/);assert.throws(()=>sameOrigin(r('https://evil.example')),/Origen/);assert.doesNotThrow(()=>sameOrigin(r('https://rpm.example')));});
