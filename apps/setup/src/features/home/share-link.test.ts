import { describe, expect, it } from 'vitest';
import { decodeSharedWorkout, encodeSharedWorkout } from './share-link';

describe('encodeSharedWorkout / decodeSharedWorkout', () => {
  it('round-trips name and exercises', () => {
    const workout = {
      name: 'Tren inferior + Core',
      exercises: [{ id: 'ex-1', name: 'Sentadilla búlgara', sets: 3, targetReps: '8-10', restSeconds: 90 }],
    };

    const encoded = encodeSharedWorkout(workout);
    expect(decodeSharedWorkout(encoded)).toEqual(workout);
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
