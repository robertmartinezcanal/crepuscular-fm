import List "mo:core/List";
import Types "../types/schedule";

module {
  // Numeric rank for each weekday so the schedule can be ordered
  // Monday-first, matching how a weekly radio grid is read.
  func weekdayRank(weekday : Types.Weekday) : Nat {
    switch (weekday) {
      case (#monday) { 0 };
      case (#tuesday) { 1 };
      case (#wednesday) { 2 };
      case (#thursday) { 3 };
      case (#friday) { 4 };
      case (#saturday) { 5 };
      case (#sunday) { 6 };
    };
  };

  // Order by weekday first, then by start time. Start times are stored as
  // zero-padded 24-hour "HH:MM" text, so a plain text comparison orders them.
  func compareSlots(a : Types.ProgramSlot, b : Types.ProgramSlot) : { #less; #equal; #greater } {
    let ra = weekdayRank(a.weekday);
    let rb = weekdayRank(b.weekday);
    if (ra < rb) {
      #less;
    } else if (ra > rb) {
      #greater;
    } else if (a.startTime < b.startTime) {
      #less;
    } else if (a.startTime > b.startTime) {
      #greater;
    } else {
      #equal;
    };
  };

  public func listSchedule(schedule : List.List<Types.ProgramSlot>) : [Types.ProgramSlot] {
    schedule.toArray().sort(compareSlots);
  };
};
