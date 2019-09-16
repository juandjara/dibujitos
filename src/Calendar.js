import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  &:last-child {
    margin-bottom: 20px;
  }
  h3 {
    margin-left: 8px;
    margin-bottom: 0;
    margin-top: 2rem;
    font-weight: lighter;
    font-size: 1.5rem;
  }
  li {
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 14px 0;
    a {
      flex: 1;
      margin-right: 10px;
    }
    p {
      margin: 0;
    }
  }
  .nodata {
    margin-left: 8px;
    margin-top: 4px;
    opacity: 0.8;
  }
`;

const CalendarStyles = styled.div`
  @media (min-width: 920px) {
    flex-basis: 420px;
  }
  header {
    padding: 0 8px;
    h2 {
      font-size: 1.5rem;
      font-weight: normal;
      margin-top: 2.5rem;
      margin-bottom: 5px;
    }
    p {
      margin-top: 5px;
      opacity: .8;
    }
  }
`;

const dayMap = {
  'Monday': 'Lunes',
  'Tuesday': 'Martes',
  'Wednesday': 'Miércoles',
  'Thursday': 'Jueves',
  'Friday': 'Viernes',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo',
  'Today': 'Hoy'
}

function formatTime(timeStr) { 
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) {
    return '';
  }
  return format(date, 'HH:MM');
}

const endpoint = "https://nyapi.fuken.xyz";
function Calendar() {
  const [calendar, setCalendar] = useState([]);

  // using an empty watchilist runs the effect only on mount and unmount
  const propsWatchlist = [];
  useEffect(async () => {
    const url = `${endpoint}/calendar`;
    const data = await window.fetch(url);
    const json = await data.json();
    // TODO: fix this in backend when 
    // this https://github.com/tanukiapp/hs-calendar/pull/5 is merged
    const cal = json.map((elem, index) => {
      const prev = json[index - 1];
      if (!prev) {
        return elem;
      }
      elem.day = elem.day.split(' ')[0];
      elem.animes = prev.animes;
      return elem;
    }).slice(1);
    setCalendar(cal);
  }, propsWatchlist)

  return ( 
    <CalendarStyles className="column">
      <header>
        <h2>Calendario</h2>
        <p>Horario de emision de capitulos de HorribleSubs</p>
      </header>
      {calendar.map(group => (
        <List key={group.day}>
          <h3>{dayMap[group.day] || group.day}</h3>
          <p className="nodata">
            {group.animes.length ? '' : 'Sin capítulos este día'}
          </p>
          {group.animes.map(item => (
            <li key={item.slug + group.day + item.time}>
              <Link to={item.slug}>{item.title}</Link>
              <p>{formatTime(item.time)}</p>
            </li>
          ))}
        </List>
      ))}
    </CalendarStyles>
  );
}

export default Calendar;