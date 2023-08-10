import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { Icon } from '@rneui/themed';
import { Appearance } from 'react-native';


export default function App() {
  const [combo, setCombo] = useState<string[]>([]);
  const [solution, setSolution] = useState<string[]>([]);
  const [selected, setSelected] = useState(-1);
  const [answer, setAnswer] = useState(false);

  const [nums, setNums] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [start, setStart] = useState(false);
  
  async function generateCombo() {
    var types: string[] = ["-", "+", "*", "*", "-", "+", "/"];
    var result: string[] = [];
    for (let i = 0; i < 3; i++) {
      if (result.includes("/") || i != 2) {
        result.push(types[Math.floor(Math.random() * 6)]);
      } else {
        result.push(types[Math.floor(Math.random() * 7)]);

      }
    }
    if (result.filter(x => x == "-").length > 1 && result[0] == "-") {
      return generateCombo();

    } else {
      return result;
    }
  }
  async function generateNumbers(combo: string[]): Promise<number[]> {
    for (let k = 0; k < 2000; k++) {
      var result = Math.floor(Math.random() * 9 + 1);
      var nums: number[] = [result];
      for (let i = 0; i < 3; i++) {
        var genNum: number = Math.floor(Math.random() * 9 + 1)
        switch (combo[i]) {
          case "+":
            result += genNum;
            break;
          case "-":
            result -= genNum;
            break;
          case "*":
            result *= genNum;
            break;
          default:
            result /= genNum;
            break;
        }
        nums.push(genNum)

      }
      if (result == 24) {
        return nums;
      }

    }
    const newCombo = await generateCombo()
    setCombo(newCombo);
    return await generateNumbers(newCombo);

  }
  async function generatePermutations() {
    var permutations: string[][] = [];
    var types: string[] = ["-", "+", "*", "/"];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          permutations.push([types[i], types[j], types[k]]);
        }
      }
    }
    return permutations;
  }

  async function checkDifficulty(permutations: string[][], generated: number[]) {
    var succesful: string[] = [];
    for (let i = 0; i < 4; i++) {
      var newGen = generated.slice()
      var newL: number[] = [generated[i]]
      var oldL = generated.slice();
      newGen.splice(i, 1);
      oldL = newGen.slice();
      let oldL2 = newGen.slice();
      for (let j = 0; j < 3; j++) {
        newGen = oldL2.slice();
        newL.push(newGen[j]);
        newGen.splice(j, 1);
        oldL = newGen.slice();
        for (let k = 0; k < 2; k++) {
          newGen = oldL.slice()
          newL.push(newGen[k]);
          newGen.splice(k, 1);
          newL.push(newGen[0]);
          newGen.splice(0, 1);
          for (let l = 0; l < permutations.length; l++) {
            var perm = permutations[l];
            var result: number = eval("(" + newL[0] + perm[0] + newL[1] + ")" + perm[1] + "(" + newL[2] + perm[2] + newL[3] + ")")
            if (result == 24) {
              var newStr = "(" + newL[0] + " " + perm[0] + " " + newL[1] + ") " + perm[1] + " (" + newL[2] + " " + perm[2] + " " + newL[3] + ")&&";
              newStr += newL[0] + " " + perm[0] + " " + newL[1] + " = " + eval(newL[0] + " " + perm[0] + " " + newL[1]) + "\n";
              newStr += newL[2] + " " + perm[2] + " " + newL[3] + " = " + eval(newL[2] + " " + perm[2] + " " + newL[3]) + "\n";
              newStr += eval(newL[0] + " " + perm[0] + " " + newL[1]) + " " + perm[1] + " " + eval(newL[2] + " " + perm[2] + " " + newL[3]) + " = 24\n";
              succesful.push(newStr)


            }
          }
          for (let l = 0; l < permutations.length; l++) {
            var result = newL[0];
            var perm = permutations[l];
            for (let m = 0; m < 3; m++) {
              var num = newL[m + 1];
              switch (perm[m]) {
                case "+":
                  result += num;
                  break;
                case "-":
                  result -= num;
                  break;
                case "*":
                  result *= num;
                  break;
                default:
                  result /= num;
                  break;
              }
            }
            if (result == 24) {
              var newStr = "(((" + newL[0];
              for (let n = 1; n < 4; n++) {
                newStr += " " + perm[n - 1] + " " + newL[n] + ")";
              }
              newStr += "&&"
              result = newL[0];

              for (let m = 0; m < 3; m++) {
                var num = newL[m + 1];
                var oldResult = result;
                switch (perm[m]) {
                  case "+":
                    result += num;
                    break;
                  case "-":
                    result -= num;
                    break;
                  case "*":
                    result *= num;
                    break;
                  default:
                    result /= num;
                    break;

                }
                newStr += oldResult + " " + perm[m] + " " + num + " = " + result + "\n";

              }

              succesful.push(newStr)


            }
          }
          newL.pop();
          newL.pop();

        }
        newL.pop();

      }
    }


    return succesful;
  }
  const perms = generatePermutations();
  async function generate() {
    try {
      const newCombo = await generateCombo()
      setCombo(newCombo);
      const genNums = await generateNumbers(newCombo)
      setNums(genNums);
      const perms = await generatePermutations();
      let solutions = await checkDifficulty(perms, genNums)
      solutions = solutions.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      })
      setSolution(solutions);
      setStart(true);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

  }
  function begin() {
    setAnswer(false);
    setSelected(-1);
    setIsLoading(true);
    setError(null);
    generate();
  }
  function back() {
    setAnswer(false);
    setSelected(-1);
    setStart(false)
    setError(null);
  }
  function showAnswer() {
    setAnswer(true);
  }
  return (
    <SafeAreaView style={styles.container}>
      <View>

        {answer ? (
          <View style={{ alignContent: "flex-start", marginLeft: 25 }}>
            <View style={{flexDirection:"row", justifyContent:"flex-start"}}>
              <Text style={[styles.mainText, { fontSize: 45, marginBottom: 10, marginTop: 30, alignSelf:"flex-start" }]}>Solutions</Text>
              <TouchableOpacity style={{ height: 35, maxWidth: 60, paddingHorizontal: 10, paddingVertical: 5, marginTop: 40, marginLeft: 10, backgroundColor: (solution.length < 5 ? "#FF7A65" : solution.length < 10 ? "#FFBE65" : "#FDFF65"),alignSelf:"flex-start" ,borderRadius:15}}>
                <Text style={{fontSize:20}}>{solution.length}</Text>
              </TouchableOpacity>

            </View>
            <ScrollView style={{ paddingBottom: 20, maxHeight: 450 }}>
              {
                solution.map((item, index) => (
                  <TouchableOpacity onPress={function () {
                    if (selected == index) {
                      setSelected(-1)
                    } else {
                      setSelected(index);
                    }
                  }} key={index} style={{ paddingVertical: 5, borderColor: "black", borderWidth: 2, borderRadius: 10, paddingHorizontal: 20, margin: 5, width: 300 }}>
                    {selected == index ? (
                      <View>
                        <Text style={{ fontSize: 30, fontWeight: "700" }} > {item.split("&&")[0]}</Text>
                        {
                          item.split("&&")[1].split("\n").map((item, index) => (
                            <Text style={{ fontSize: 25, marginLeft: 10 }} key={index}>{item}</Text>

                          ))
                        }
                      </View>


                    ) : (
                      <Text style={{ fontSize: 30, fontWeight: "600" }} > {item.split("&&")[0]}</Text>

                    )}
                  </TouchableOpacity>
                ))
              }



            </ScrollView>
            <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
              <TouchableOpacity onPress={begin} style={[styles.start, { alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 20, width: 200 }]}><Text style={{ fontSize: 30, fontWeight: "900" }}>Next</Text></TouchableOpacity>


            </View>
            <TouchableOpacity onPress={back} style={[styles.start, { alignItems: "center", justifyContent: "center", alignSelf: "flex-end", marginTop: 0, width: 50, padding: 9, marginLeft: 5, height: 55, position: "absolute", backgroundColor: "none" }]}>
              <Icon
                name='logout' style={{ height: 70, width: 70, fontSize: 50 }} size={33} />
            </TouchableOpacity>

          </View>
        ) : start ? (
          <View>
          
            {solution.length < 5 ? (
              <View style={{ width: 200, height: 50, marginBottom: 30, justifyContent: "center", alignSelf: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#FF7A65" }}>
                <Text style={{ fontWeight: "800", fontSize: 30 }}>Hard</Text>
              </View>
            ) : solution.length < 10 ? (
              <View style={{ width: 200, height: 50, marginBottom: 30, justifyContent: "center", alignSelf: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#FFBE65" }}>
                <Text style={{ fontWeight: "800", fontSize: 30 }}>Intermediate</Text>
              </View>
            ) : (
              <View style={{ width: 200, height: 50, marginBottom: 30, justifyContent: "center", alignSelf: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#FDFF65" }}>
                <Text style={{ fontWeight: "800", fontSize: 30 }}>Easy</Text>
              </View>)}
            <View>
              <View style={[styles.numBox, { alignSelf: "center" }]}>
                <Text style={{ fontSize: 80, fontWeight: "600", textAlign: "center" }} >{nums[0]}</Text>

              </View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <View style={[styles.numBox, { alignSelf: "flex-start", marginRight: 100 }]}>
                  <Text style={{ fontSize: 80, fontWeight: "600", textAlign: "center" }} >{nums[1]}</Text>

                </View>
                <View style={[styles.numBox, { alignSelf: "flex-end" }]}>
                  <Text style={{ fontSize: 80, fontWeight: "600", textAlign: "center" }} >{nums[2]}</Text>

                </View>

              </View>
              <View style={[styles.numBox, { alignSelf: "center" }]}>
                <Text style={{ fontSize: 80, fontWeight: "600", alignSelf: "center" }} >{nums[3]}</Text>

              </View>
              <TouchableOpacity onPress={showAnswer} style={[styles.start, { alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 20, width: 200 }]}><Text style={{ fontSize: 30, fontWeight: "900" }}>Solution</Text></TouchableOpacity>
              
            </View>
          </View>

        ) : isLoading ? (
          <View>
            <ActivityIndicator size='large' color="black" />

            <Text style={{ fontSize: 20 }}>Start</Text>
          </View>

        ) : (
          <View style={{ alignContent: "flex-start", paddingLeft: 25 }}>
            <Text style={styles.mainText}>24 Practice</Text>
            <TouchableOpacity style={styles.start}><Text onPress={() => begin()} style={{ fontSize: 30, fontWeight: "900" }}>Practice</Text></TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView >

  );
}

const styles = StyleSheet.create({
  start: {
    backgroundColor: "#6AC9FF",
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    width: 190
  },
  container: {
    flex:1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  showNum: {
    fontSize: 80,
    fontWeight: "900"
  },
  mainText: {
    fontSize: 80,
    fontWeight: "900",
    marginBottom: 20
  },
  numBox: {
    width: 100,
    height: 100,
    margin: 5,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 25
  }
});
