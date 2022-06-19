import { useReducer, useState } from 'preact/hooks';
import { render } from 'preact';

interface Slot {
  id: number;
  time: number;
  relative: boolean;
}

const gid = () => Math.round(Math.random() * 10 ** 8);

const newSlot: () => Slot = () => ({
  id: gid(),
  time: 0,
  relative: true,
});

type Transaction = (slots: Slot[]) => Slot[];

const removeAtIndex = (arr: Array<any>, index: number) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
];

const tryCall = <F extends Function, P extends Parameters<any>>(
  fn: F,
  ...args: P
) => fn && fn(...args);

interface TimerProps {
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onTick?: () => void;
  rate?: number;
}

interface TimerSprint {
  startTime: number;
  timeVal: number;
  interval: number;
}

type TimerState = 'on' | 'off' | 'paused';
type TimerAction = 'start' | 'stop' | 'pause';

function Timer(props: TimerProps) {
  const rate = props.rate ?? 1000;

  const [sprint, setSprint] = useState<TimerSprint>({
    startTime: null,
    timeVal: null,
    interval: null,
  });
  const [time, setTime] = useReducer<number, 'increment' | 'reset'>(
    (_, action) => {
      const now = Date.now();
      const diff = now - sprint.startTime;
      if (action === 'reset') {
        return 0;
      } else if (action === 'increment') {
        return sprint.timeVal + diff / 1000;
      }
    },
    0
  );
  const [state, setState] = useReducer<TimerState, TimerAction>(
    (prevState, action) => {
      const start = (): TimerState => {
        setSprint({
          startTime: Date.now(),
          timeVal: time,
          interval: setInterval(tick, rate),
        });
        tryCall(props.onStart);
        return 'on';
      };

      const stop = (): TimerState => {
        clearInterval(sprint.interval);
        setTime('reset');
        tryCall(props.onStop);
        return 'off';
      };

      const pause = (): TimerState => {
        clearInterval(sprint.interval);
        tryCall(props.onPause);
        return 'paused';
      };

      if (action === 'stop') {
        return stop();
      } else if (action === 'start') {
        return start();
      } else if (action === 'pause' && prevState === 'paused') {
        return start();
      } else if (action === 'pause' && prevState === 'on') {
        return pause();
      }

      return prevState;
    },
    'off'
  );

  const toggle = () => (state === 'on' ? setState('pause') : setState('start'));
  const stop = () => setState('stop');
  const tick = () => {
    tryCall(props.onTick);
    setTime('increment');
  };

  const buttonText = () => {
    const obj: Record<TimerState, string> = {
      on: 'Pause',
      off: 'Start',
      paused: 'Resume',
    };

    return obj[state];
  };

  return (
    <div className="timer">
      <span>{Math.ceil(time)}</span>
      <button onClick={toggle}>{buttonText()}</button>
      <button onClick={stop}>Reset</button>
    </div>
  );
}

function App() {
  const [slots, alterSlots] = useReducer<Slot[], Transaction>(
    (slots, transaction) => transaction(slots),
    []
  );

  const addSlot = () => alterSlots((list) => [...list, newSlot()]);
  const removeSlot = (id: Slot['id']) =>
    alterSlots((list) =>
      removeAtIndex(
        slots,
        list.findIndex((el) => el.id === id)
      )
    );

  return (
    <main>
      <Timer rate={100} />
      <button onClick={addSlot}>Add</button>
      <ul>
        {slots.map((slot) => (
          <li>
            {slot.id}{' '}
            <button onClick={() => removeSlot(slot.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

render(<App />, document.body);
