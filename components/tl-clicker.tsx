
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Camera,
  Minus,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';

import { apiPost, getBooths } from '@/lib/api';
import { useLiveDashboard } from '@/lib/hooks';
import type { Booth, SessionUser } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

type Metric = 'VISITOR' | 'UNIQUE_MIRROR' | 'PHOTO_BOOTH';

type ClickEvent = {
  venueId: string;
  metric: Metric;
  delta: 1 | -1;
};

const METRICS: {
  id: Metric;
  label: string;
  icon: typeof Users;
}[] = [
  { id: 'VISITOR', label: 'Booth Visitors', icon: Users },
  { id: 'UNIQUE_MIRROR', label: 'Unique Mirror', icon: Sparkles },
  { id: 'PHOTO_BOOTH', label: 'Photo Booth', icon: Camera },
];

const INITIAL_COUNTS: Record<Metric, number> = {
  VISITOR: 0,
  UNIQUE_MIRROR: 0,
  PHOTO_BOOTH: 0,
};

function getQueueKey(venueId: string, metric: Metric) {
  return `${venueId}:${metric}`;
}

export default function TlClicker({
  token,
  user,
}: {
  token: string;
  user: SessionUser;
}) {
  const { data, refresh } = useLiveDashboard(token, 15000);

  const [metric, setMetric] = useState<Metric>('VISITOR');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [venueId, setVenueId] = useState(user.venueId || '');

  const [counts, setCounts] =
    useState<Record<Metric, number>>(INITIAL_COUNTS);

  const [queueLength, setQueueLength] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Synchronous count reference prevents rapid taps
  // from reading an outdated React state value.
  const countsRef = useRef<Record<Metric, number>>(INITIAL_COUNTS);

  // Pending changes are tracked separately per venue and metric.
  const pendingDeltaRef = useRef<Record<string, number>>({});

  // Events are sent sequentially to protect server totals.
  const queueRef = useRef<ClickEvent[]>([]);
  const processingRef = useRef(false);

  const venueStats = data?.venues.find(
    (v) => v.venueId === venueId
  );

  function updateCount(metricId: Metric, value: number) {
    const safeValue = Math.max(0, value);

    countsRef.current = {
      ...countsRef.current,
      [metricId]: safeValue,
    };

    setCounts(countsRef.current);
  }

  useEffect(() => {
    getBooths(token)
      .then((list) => {
        setBooths(list);

        setVenueId((current) => {
          return current || list[0]?.venueId || '';
        });
      })
      .catch(() => undefined);
  }, [token]);

  // Apply server totals while preserving locally pending taps.
  useEffect(() => {
    if (!venueStats) return;

    const base: Record<Metric, number> = {
      VISITOR: venueStats.visitors,
      UNIQUE_MIRROR: venueStats.uniqueMirror,
      PHOTO_BOOTH: venueStats.photoBooth,
    };

    const adjusted = { ...base };

    METRICS.forEach((item) => {
      const key = getQueueKey(venueId, item.id);
      adjusted[item.id] = Math.max(
        0,
        base[item.id] + (pendingDeltaRef.current[key] || 0)
      );
    });

    countsRef.current = adjusted;
    setCounts(adjusted);
  }, [venueStats, venueId]);

  // Background queue processor.
  // No server request blocks the user's next tap.
  async function drainQueue() {
    if (processingRef.current) return;

    processingRef.current = true;
    setSyncing(true);

    try {
      while (queueRef.current.length > 0) {
        const event = queueRef.current[0];

        const key = getQueueKey(event.venueId, event.metric);

        try {
          const result = await apiPost<{
            total: number;
            delta: number;
          }>('visitorClick', token, {
            venueId: event.venueId,
            metric: event.metric,
            delta: event.delta,
          });

          // Remove acknowledged event.
          queueRef.current.shift();

          pendingDeltaRef.current[key] =
            (pendingDeltaRef.current[key] || 0) - event.delta;

          if (pendingDeltaRef.current[key] === 0) {
            delete pendingDeltaRef.current[key];
          }

          // Update only if the user is still viewing this venue.
          // Preserve any taps waiting behind this request.
          if (venueId === event.venueId) {
            updateCount(
              event.metric,
              result.total +
                (pendingDeltaRef.current[key] || 0)
            );
          }

          setQueueLength(queueRef.current.length);
          setError('');

        } catch (e) {
          // Roll back only the failed event.
          queueRef.current.shift();

          pendingDeltaRef.current[key] =
            (pendingDeltaRef.current[key] || 0) - event.delta;

          if (pendingDeltaRef.current[key] === 0) {
            delete pendingDeltaRef.current[key];
          }

          if (venueId === event.venueId) {
            updateCount(
              event.metric,
              countsRef.current[event.metric] - event.delta
            );
          }

          setQueueLength(queueRef.current.length);

          setError(
            e instanceof Error
              ? e.message
              : 'Unable to synchronize visitor count'
          );

          // Continue processing remaining events.
        }
      }
    } finally {
      processingRef.current = false;
      setSyncing(false);

      if (queueRef.current.length === 0) {
        void refresh();
      }
    }
  }

  // Immediate local update, then enqueue server synchronization.
  function click(delta: 1 | -1) {
    if (!venueId) {
      setError('Please select an activation venue.');
      return;
    }

    if (delta < 0 && countsRef.current[metric] <= 0) {
      return;
    }

    setError('');
    setMessage('');

    // Update screen immediately.
    updateCount(
      metric,
      countsRef.current[metric] + delta
    );

    const key = getQueueKey(venueId, metric);

    pendingDeltaRef.current[key] =
      (pendingDeltaRef.current[key] || 0) + delta;

    // Add transaction to queue.
    queueRef.current.push({
      venueId,
      metric,
      delta,
    });

    setQueueLength(queueRef.current.length);

    setMessage(
      delta > 0
        ? '+1 recorded locally'
        : 'Count adjustment recorded'
    );

    // Start background synchronization.
    void drainQueue();

    // Short tactile feedback without blocking interaction.
    if (
      delta > 0 &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(20);
    }
  }

  const current = counts[metric];

  const activeLabel =
    METRICS.find((item) => item.id === metric)?.label || '';

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* HEADER */}
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">
            PRIMARY TL CONTROL
          </p>

          <h3 className="mt-1 text-lg font-black">
            Digital Visitor Clicker
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {venueId} · {venueStats?.name || 'Assigned venue'}
          </p>
        </div>

        <span className="tag bg-emerald-50 text-emerald-700">
          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {syncing ? 'SYNCING' : 'READY'}
        </span>
      </div>

      <div className="panel panel-pad">

        {/* ADMIN VENUE SELECTOR */}
        {user.role === 'ADMIN' && (
          <div className="mb-4">
            <label className="field-label">
              Select venue to count
            </label>

            <select
              className="field-input"
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
            >
              {booths.map((booth) => (
                <option
                  key={booth.venueId}
                  value={booth.venueId}
                >
                  {booth.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* METRIC SELECTOR */}
        <div className="grid grid-cols-3 gap-2">
          {METRICS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setMetric(item.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  metric === item.id
                    ? 'border-kd-blue bg-blue-50 text-kd-blue'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} aria-hidden="true" />

                <p className="mt-2 text-[11px] font-bold leading-4">
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* MAIN COUNTER */}
        <div className="py-10 text-center select-none">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">
            {activeLabel} · TOTAL COUNT
          </p>

          <p
            aria-live="polite"
            className="mt-2 text-7xl font-black tabular-nums tracking-tighter text-slate-900 md:text-8xl"
          >
            {formatNumber(current)}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Instant local count · Background server synchronization
          </p>
        </div>

        {/* FEEDBACK */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && !error && (
          <div
            aria-live="polite"
            className="mb-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-xs font-bold text-emerald-700"
          >
            {message}
          </div>
        )}

        {/* HIGH SPEED BUTTONS */}
        <div className="grid grid-cols-[.75fr_1.7fr] gap-3">

          <button
            type="button"
            onClick={() => click(-1)}
            disabled={current <= 0}
            aria-label="Undo one count"
            className="flex min-h-[108px] touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white text-slate-500 transition active:scale-[.97] hover:border-red-200 hover:bg-red-50 hover:text-kd-red disabled:opacity-35"
          >
            <Minus size={25} aria-hidden="true" />

            <span className="text-xs font-black uppercase tracking-wider">
              Undo -1
            </span>
          </button>

          <button
            type="button"
            onClick={() => click(1)}
            aria-label={`Add one ${activeLabel}`}
            className="flex min-h-[108px] touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-2xl bg-kd-blue text-white shadow-[0_12px_26px_rgba(0,51,153,.22)] transition hover:bg-blue-900 active:scale-[.97]"
          >
            <Plus size={31} strokeWidth={3} aria-hidden="true" />

            <span className="text-base font-black tracking-wider">
              +1 {metric === 'VISITOR'
                ? 'VISITOR'
                : metric === 'UNIQUE_MIRROR'
                  ? 'MIRROR USER'
                  : 'PHOTO BOOTH'}
            </span>

            <span className="text-[10px] text-blue-200">
              TAP TO RECORD
            </span>
          </button>
        </div>

        {/* SYNC STATUS */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Pending synchronization
          </p>

          <p className="text-xs font-bold tabular-nums text-kd-blue">
            {queueLength} events
          </p>
        </div>
      </div>

      {/* METRIC SUMMARY */}
      <div className="grid gap-3 sm:grid-cols-3">
        {METRICS.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  {item.label}
                </p>

                <Icon
                  size={15}
                  className="text-kd-blue"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-2 text-2xl font-black tabular-nums">
                {formatNumber(counts[item.id])}
              </p>
            </div>
          );
        })}
      </div>

      <p className="px-1 text-[11px] leading-5 text-slate-400">
        Counts update instantly on this device. Server synchronization
        runs independently in the background. Undo is recorded as a
        negative event in the audit log. Reconcile larger discrepancies
        through venue handover.
      </p>
    </div>
  );
}
