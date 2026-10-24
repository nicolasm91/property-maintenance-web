import { useState } from 'react';
import Booking from './Booking.tsx';
import Profile from './Profile.tsx';
import TaskList from './TaskList.tsx';
import TradesEditor from './TradesEditor.tsx';
import type { User } from './user.ts';

export default function Dashboard({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
  // Remounting the list reloads it after a booking.
  const [bookings, setBookings] = useState(0);

  return (
    <>
      <Profile user={user} />
      {user.role === 'directClient' && (
        <>
          <Booking homes={user.homes} onBooked={() => setBookings((count) => count + 1)} />
          <TaskList key={bookings} role="directClient" />
        </>
      )}
      {user.role === 'tradesman' && (
        <>
          <TradesEditor trades={user.trades} onSaved={setUser} />
          <TaskList role="tradesman" />
        </>
      )}
    </>
  );
}
