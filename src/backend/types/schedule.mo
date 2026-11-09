module {
  public type Weekday = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  public type ProgramSlot = {
    weekday : Weekday;
    startTime : Text;
    endTime : Text;
    name : Text;
    description : Text;
  };
};
