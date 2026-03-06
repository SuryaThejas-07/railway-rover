import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchTrains, Train, getSchedulesForDate, TrainSchedule } from "@/services/trainService";
import TrainCard from "@/components/TrainCard";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";

const SearchResults = () => {
  const [params] = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const source = params.get("source") || "";
  const destination = params.get("destination") || "";
  const date = params.get("date") || "";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Search trains by source/destination and date
        const searchedTrains = await searchTrains(source, destination, date);
        setTrains(searchedTrains);

        // Get schedules for the date
        if (date) {
          try {
            const dateSchedules = await getSchedulesForDate(date);
            setSchedules(dateSchedules);
          } catch (error) {
            console.warn("Could not load schedules:", error);
            setSchedules([]);
          }
        }
      } catch (error) {
        console.error("Error loading trains:", error);
        setTrains([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    if (source && destination) {
      loadData();
    }
  }, [source, destination, date]);

  const handleBook = (train: Train) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if train is available on selected date
    const schedule = schedules.find(s => s.trainId === train.id);
    if (!schedule || schedule.seatsAvailable <= 0) {
      alert("No seats available for this date. Please select another train or date.");
      return;
    }

    navigate("/passenger-details", { state: { train, date } });
  };

  if (loading) return <Loader />;

  // Filter trains that have available schedules for the selected date
  const availableTrains = trains.filter(t => {
    const schedule = schedules.find(s => s.trainId === t.id);
    return schedule && schedule.seatsAvailable > 0;
  });

  return (
    <div className="container mx-auto max-w-4xl animate-fade-in px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">
        {source} → {destination}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Travel date: <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
      </p>

      {availableTrains.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-warning" />
          <p className="text-lg font-semibold">No trains available</p>
          <p className="text-sm text-muted-foreground">
            {trains.length === 0 
              ? "No trains found for this route." 
              : "All trains are fully booked for this date."}
          </p>
          <p className="text-xs text-muted-foreground">Try a different route or date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableTrains.map((t) => {
            const schedule = schedules.find(s => s.trainId === t.id);
            return (
              <div key={t.id} className="relative">
                <TrainCard 
                  train={t} 
                  onBook={handleBook}
                  seatsAvailable={schedule?.seatsAvailable || 0}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
