import { useEffect, useState } from "react";
import {
  getAllTrains,
  addTrain,
  updateTrain,
  deleteTrain,
  Train,
  TrainSchedule,
  addTrainSchedule,
  updateTrainSchedule,
  deleteTrainSchedule,
  getTrainSchedules,
  getSchedulesForDate,
  regenerateSchedulesFor30Days,
} from "@/services/trainService";
import { getAllBookings, Booking } from "@/services/bookingService";
import Loader from "@/components/Loader";
import { Plus, Pencil, Trash2, X, TicketCheck, Calendar, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const emptyTrain = {
  trainNumber: "",
  trainName: "",
  source: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  fare: 0,
  totalSeats: 0,
  seatsAvailable: 0,
};

const emptySchedule = {
  trainId: "",
  date: "",
  seatsAvailable: 0,
  isActive: true,
};

const Admin = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"trains" | "bookings" | "schedules">("trains");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Train | null>(null);
  const [form, setForm] = useState(emptyTrain);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Schedule form states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [selectedTrainForSchedule, setSelectedTrainForSchedule] = useState<Train | null>(null);
  const [trainSchedules, setTrainSchedules] = useState<TrainSchedule[]>([]);
  const [regeneratingTrainId, setRegeneratingTrainId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, b] = await Promise.all([getAllTrains(), getAllBookings()]);
      setTrains(t);
      setBookings(b);
      
      // Load all schedules with error handling
      try {
        const allSchedules = await Promise.all(
          t.map(train => getTrainSchedules(train.id).catch(() => []))
        );
        setSchedules(allSchedules.flat());
      } catch (error) {
        console.warn("Could not load schedules - collection may not exist yet:", error);
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      showMessage("error", "Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show message with auto-dismiss
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ============ TRAINS TAB ============
  const handleSave = async () => {
    try {
      if (editing) {
        await updateTrain(editing.id, form);
        showMessage("success", "Train updated successfully!");
      } else {
        await addTrain({ ...form, seatsAvailable: form.totalSeats });
        showMessage("success", "Train added! 🎉 Auto-generated schedules for the next 30 days.");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyTrain);
      loadData();
    } catch (error) {
      showMessage("error", "Failed to save train. Please try again.");
    }
  };

  const handleEdit = (t: Train) => {
    setEditing(t);
    setForm({
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      source: t.source,
      destination: t.destination,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      fare: t.fare,
      totalSeats: t.totalSeats,
      seatsAvailable: t.seatsAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this train and all its schedules?")) return;
    try {
      await deleteTrain(id);
      showMessage("success", "Train deleted successfully!");
      loadData();
    } catch (error) {
      showMessage("error", "Failed to delete train. Please try again.");
    }
  };

  const handleRegenerateSchedules = async (train: Train) => {
    setRegeneratingTrainId(train.id);
    try {
      await regenerateSchedulesFor30Days(train.id, train);
      showMessage("success", `Generated schedules for next 30 days for ${train.trainName}`);
      loadData();
    } catch (error) {
      showMessage("error", "Failed to generate schedules. Please try again.");
    } finally {
      setRegeneratingTrainId(null);
    }
  };

  // ============ SCHEDULES TAB ============
  const handleSelectTrainForSchedule = async (train: Train) => {
    setSelectedTrainForSchedule(train);
    const ts = await getTrainSchedules(train.id);
    setTrainSchedules(ts);
  };

  const handleSaveSchedule = async () => {
    if (!selectedTrainForSchedule) return;

    try {
      const data = {
        ...scheduleForm,
        trainId: selectedTrainForSchedule.id,
        trainNumber: selectedTrainForSchedule.trainNumber,
        totalSeats: selectedTrainForSchedule.totalSeats,
      };

      if (editingSchedule) {
        await updateTrainSchedule(editingSchedule.id, data);
        showMessage("success", "Schedule updated successfully!");
      } else {
        await addTrainSchedule(data);
        showMessage("success", "Schedule added successfully!");
      }

      setShowScheduleForm(false);
      setEditingSchedule(null);
      setScheduleForm(emptySchedule);
      handleSelectTrainForSchedule(selectedTrainForSchedule);
      loadData();
    } catch (error) {
      showMessage("error", "Failed to save schedule. Please try again.");
    }
  };

  const handleEditSchedule = (schedule: TrainSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      trainId: schedule.trainId,
      date: schedule.date,
      seatsAvailable: schedule.seatsAvailable,
      isActive: schedule.isActive,
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await deleteTrainSchedule(id);
      showMessage("success", "Schedule deleted successfully!");
      if (selectedTrainForSchedule) {
        handleSelectTrainForSchedule(selectedTrainForSchedule);
      }
      loadData();
    } catch (error) {
      showMessage("error", "Failed to delete schedule. Please try again.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto max-w-5xl animate-fade-in px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setTab("trains")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "trains"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Trains
        </button>
        <button
          onClick={() => setTab("schedules")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
            tab === "schedules"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" /> Train Schedules
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "bookings"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Bookings
        </button>
      </div>

      {/* TRAINS TAB */}
      {tab === "trains" && (
        <>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setForm(emptyTrain);
            }}
            className="mb-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Train
          </button>

          {showForm && (
            <div className="card-shadow mb-6 rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">
                  {editing ? "Edit Train" : "Add Train"}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    "trainNumber",
                    "trainName",
                    "source",
                    "destination",
                    "departureTime",
                    "arrivalTime",
                  ] as const
                ).map((k) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs font-medium capitalize text-muted-foreground">
                      {k.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      value={form[k]}
                      onChange={(e) =>
                        setForm({ ...form, [k]: e.target.value })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
                {(["fare", "totalSeats"] as const).map((k) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs font-medium capitalize text-muted-foreground">
                      {k.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      value={form[k]}
                      onChange={(e) =>
                        setForm({ ...form, [k]: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              {!editing && (
                <p className="mt-3 text-xs text-muted-foreground">
                  ℹ️ Adding a train will automatically generate schedules for the next 30 days.
                </p>
              )}
              <button
                onClick={handleSave}
                className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {editing ? "Update" : "Add"} Train
              </button>
            </div>
          )}

          <div className="space-y-3">
            {trains.map((t) => {
              const trainScheduleCount = schedules.filter(s => s.trainId === t.id).length;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border bg-card p-4"
                >
                  <div className="flex-1">
                    <p className="font-bold">
                      {t.trainName}{" "}
                      <span className="text-xs text-muted-foreground">
                        #{t.trainNumber}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.source} → {t.destination} • ₹{t.fare} •{" "}
                      {t.seatsAvailable}/{t.totalSeats} seats
                    </p>
                    <p className="mt-1 text-xs text-success flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {trainScheduleCount} schedules available
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegenerateSchedules(t)}
                      disabled={regeneratingTrainId === t.id}
                      title="Generate schedules for next 30 days"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          regeneratingTrainId === t.id ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SCHEDULES TAB */}
      {tab === "schedules" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side: Train list */}
          <div>
            <h2 className="mb-4 font-bold text-lg">Select Train</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trains.map((t) => {
                const trainScheduleCount = schedules.filter(s => s.trainId === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrainForSchedule(t)}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      selectedTrainForSchedule?.id === t.id
                        ? "border-primary bg-primary/10"
                        : "bg-card hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold text-sm">{t.trainName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.trainNumber} • {t.source} → {t.destination}
                    </p>
                    <p className="text-xs text-success mt-1">
                      📅 {trainScheduleCount} schedules
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side: Schedule management */}
          <div>
            {selectedTrainForSchedule ? (
              <>
                <div className="mb-4 rounded-lg border bg-card p-3">
                  <p className="text-sm font-semibold">
                    {selectedTrainForSchedule.trainName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedTrainForSchedule.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{selectedTrainForSchedule.trainNumber} •
                    Capacity: {selectedTrainForSchedule.totalSeats}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    setScheduleForm(emptySchedule);
                    setShowScheduleForm(true);
                  }}
                  className="mb-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" /> Add Schedule
                </button>

                {showScheduleForm && (
                  <div className="card-shadow mb-4 rounded-xl border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-sm">
                        {editingSchedule ? "Edit Schedule" : "Add Schedule"}
                      </h3>
                      <button onClick={() => setShowScheduleForm(false)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Date (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) =>
                            setScheduleForm({
                              ...scheduleForm,
                              date: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Available Seats
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={selectedTrainForSchedule.totalSeats}
                          value={scheduleForm.seatsAvailable}
                          onChange={(e) =>
                            setScheduleForm({
                              ...scheduleForm,
                              seatsAvailable: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scheduleForm.isActive}
                          onChange={(e) =>
                            setScheduleForm({
                              ...scheduleForm,
                              isActive: e.target.checked,
                            })
                          }
                          className="rounded border"
                        />
                        <label className="text-xs font-medium text-muted-foreground">
                          Active
                        </label>
                      </div>
                      <button
                        onClick={handleSaveSchedule}
                        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                      >
                        {editingSchedule ? "Update" : "Add"} Schedule
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <p className="text-sm font-semibold">Available Dates</p>
                  {trainSchedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No schedules yet
                    </p>
                  ) : (
                    trainSchedules.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(s.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.seatsAvailable}/{s.totalSeats} seats available
                          </p>
                          {!s.isActive && (
                            <span className="mt-1 inline-block rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSchedule(s)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(s.id)}
                            className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Select a train to manage schedules
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {tab === "bookings" && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No bookings yet.
            </p>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <TicketCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {b.passengerName}{" "}
                      <span className="text-xs text-muted-foreground">
                        PNR: {b.PNR}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Train: {b.trainNumber} • {b.travelDate} • {b.coach}-
                      {b.seatNumber}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    b.bookingStatus === "confirmed"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {b.bookingStatus}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
