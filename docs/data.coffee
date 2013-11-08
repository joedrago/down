state =

  player:
    level: 1
    floor: 1
    hp: 100
    x: 0
    y: 0
    inventory: [
      {
        type: 'healthpotion'
        stack: 2
      }
      {
        type: 'platearmor'
        slot: 'chest'
        armor: 12
        equipped: true
      }
      {
        type: 'sword'
        slot: 'mainhand'
        damage: 3
        speed: 2
        equipped: true
      }
    ]

  floors: [
    {} # 0th floor, ignore

    # 1st floor
    {
      grid: [0, 0, 0] # WxH integers

      obstacles: [
        {
          type: 'wood'
          x: 0
          y: 0
        }
      ]

      npcs: [
        {
          type: 'crab'
          state: 'sleep'
          hp: 20
          cd: 0
          x: 0
          y: 0
        }
      ]

      pickups: [
        {
          x: 0
          y: 0
          item: [
            {
              type: 'healthpotion'
            }
          ]
        }
        {
          x: 0
          y: 0
          item: [
            {
              type: 'corpse' # turns into an algo item when you touch it?
            }
          ]
        }
      ]

    } # floor 1
  ] # floors
