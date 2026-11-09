import List "mo:core/List";
import Types "../types/schedule";
import ScheduleLib "../lib/schedule";

mixin (schedule : List.List<Types.ProgramSlot>) {
  // Public read: any visitor can fetch the weekly program list, ordered by
  // weekday and start time.
  public query func listSchedule() : async [Types.ProgramSlot] {
    ScheduleLib.listSchedule(schedule);
  };
};
