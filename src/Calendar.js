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
    margin-left: 20px;
    margin-bottom: 0;
    margin-top: 30px;
    font-weight: normal;
    font-size: 20px;
  }
  li {
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
    a {
      flex: 1;
      margin-right: 10px;
    }
    p {
      margin: 0;
    }
  }
  .nodata {
    margin-left: 20px;
    margin-top: 5px;
    opacity: 0.8;
  }
`;
const CalendarStyles = styled.div`
  flex-basis: 460px;
  header {
    padding: 0 20px;
    h2 {
      font-weight: normal;
      margin-top: 20px;
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
    setCalendar(json);
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