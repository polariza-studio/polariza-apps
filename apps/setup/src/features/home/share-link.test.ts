import { describe, expect, it } from 'vitest';
import { decodeSharedWorkout, encodeSharedWorkout } from './share-link';

describe('encodeSharedWorkout / decodeSharedWorkout', () => {
  it('round-trips name and exercise fields (ids are not preserved — the recipient always gets fresh ones)', () => {
    const workout = {
      name: 'Tren inferior + Core',
      exercises: [{ id: 'ex-1', name: 'Sentadilla búlgara', sets: 3, targetReps: '8-10', restSeconds: 90 }],
    };

    const encoded = encodeSharedWorkout(workout);
    const decoded = decodeSharedWorkout(encoded);
    expect(decoded?.name).toBe(workout.name);
    expect(decoded?.exercises).toEqual([
      { id: expect.any(String), name: 'Sentadilla búlgara', sets: 3, targetReps: '8-10', restSeconds: 90 },
    ]);
  });

  it('is URL-safe (no +, /, or = characters)', () => {
    const encoded = encodeSharedWorkout({
      name: 'áéí ñ workout ✓',
      exercises: [{ id: 'ex-1', name: 'Press banca', sets: 4, targetReps: '5', restSeconds: 120 }],
    });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('returns null for malformed input instead of throwing', () => {
    expect(decodeSharedWorkout('not-valid-base64!!!')).toBeNull();
    expect(decodeSharedWorkout('')).toBeNull();
  });

  it('returns null when the decoded payload is missing required fields', () => {
    const bogus = btoa(JSON.stringify({ foo: 'bar' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeSharedWorkout(bogus)).toBeNull();
  });
});
