import React, { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import Popover from "@mui/material/Popover";

import "./calendar.css";
import styles from "./calendar.module.css";
import { COLORS, MONTH_VIEW_DAYS, VIEWS, WEEK_VIEW_DAYS } from "./constants";

const CalendarComponent = (props) => {
  const { events, isLoading, renderEventPopover } = props;
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [anchorEl, setAnchorEl] = useState(null);
  const [eventDetails, setEventDetails] = useState({});

  // const handleDateClick = (arg) => {
  //   alert(`Date clicked: ${arg.dateStr}`);
  // };

  const handleEventClick = (info) => {
    console.log(`Event clicked: ${JSON.stringify(info.event)}`);
    setEventDetails(JSON.stringify(info.event));
    setAnchorEl(info.el);
  };

  // Close the popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
  };

  const renderEventContent = (eventInfo) => {
    // Get a random background color
    const backgroundColor = getRandomColor();
    return (
      <div style={{ backgroundColor }} className={styles.eventBox}>
        <strong>{eventInfo.event.title}</strong>
        <br />
        <span>{eventInfo.timeText}</span>
      </div>
    );
  };

  // Function to get dates of the current week (Monday to Saturday)
  const getWeekDates = () => {
    const now = dayjs(); // Get current date
    const monday = now.startOf("week").add(1, "day"); // Start of the week (Monday)
    const sunday = now.startOf("week");

    const startDay = currentView === "dayGridMonth" ? sunday : monday;
    const weekDates = [];

    const dateLimit = currentView === "dayGridMonth" ? 7 : 6;
    for (let i = 0; i < dateLimit; i++) {
      // Loop only 6 times for Mon to Sat
      const date = startDay.add(i, "day"); // Get each day from Monday to Saturday
      weekDates.push(date.date()); // Push only the day number (e.g., 23, 24)
    }

    return weekDates;
  };

  // Function to customize day header content
  const renderDayHeader = (arg) => {
    const dayName = arg.date.getUTCDay(); // Get the day of the week (0-6)
    const customText =
      currentView === "dayGridMonth"
        ? MONTH_VIEW_DAYS[dayName]
        : WEEK_VIEW_DAYS[dayName];
    const weekDates = getWeekDates(); // Get week dates
    const dayDate = weekDates[dayName]; // Get date for current day
    return (
      <div className={styles.calendarHeading}>
        <span className={styles.calendarDate}>{dayDate}</span>{" "}
        <span className={styles.calendarDay}>{customText}</span>
      </div>
    );
  };

  const renderCustomViewButtons = useMemo(() => {
    return (
      <div className={styles.viewButtons}>
        {VIEWS.map((view) => {
          const isActive = currentView === view.name;
          return (
            <IconButton
              key={view.name}
              className={isActive ? styles.iconActiveButton : styles.iconButton}
              onClick={() => handleViewButton(view.name)}
            >
              <view.icon />
            </IconButton>
          );
        })}
      </div>
    );
  }, [currentView]);

  const handleViewButton = (view) => {
    calendarRef.current.getApi().changeView(view);
    setCurrentView(view);
  };

  // Check if popover is open
  const open = Boolean(anchorEl);
  return (
    <div className={styles.calendarRoot}>
      {renderCustomViewButtons}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="timeGridWeek"
        hiddenDays={currentView !== "dayGridMonth" && [0]} // Hide Sunday (0 represents Sunday)
        headerToolbar={{
          left: "prev,next today",
          center: currentView !== "timeGridWeek" ? "title" : "",
          right: "",
        }}
        slotMinTime="09:00:00" // Start time for the day view
        slotMaxTime="16:00:00" // End time for the day view
        editable={true}
        selectable={true}
        allDaySlot={false}
        nowIndicator={true}
        timeZone="local"
        eventContent={renderEventContent}
        events={events}
        dayHeaderContent={renderDayHeader} // Customize day headers
        // dateClick={handleDateClick}
        eventClick={handleEventClick}
        // Time customization
        slotLabelFormat={{ hour: "2-digit", hour12: false }} // Time format
        // Customizing the height of time slots
        slotEventOverlap={false} // Prevent overlap of events
        eventDisplay="block" // Display events as block
        // Optional: custom time grid height
        height="auto" // Set fixed height for the time grid
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {renderEventPopover({
          appointment: eventDetails,
          callBack: handleClose,
        })}
      </Popover>
    </div>
  );
};

export default CalendarComponent;
