import React, { Component, useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
// Codemirror Styling
// require('codemirror/lib/codemirror.css');
import 'codemirror/lib/codemirror.css';
import axios from 'axios';

// Codemirror Languages
import 'codemirror/mode/javascript/javascript';

// Codemirror Themes
import 'codemirror/mode/markdown/markdown';
import 'codemirror/theme/blackboard.css';
require('codemirror/addon/edit/closebrackets');

//material ui
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

// Codemirror Component
const CodeMirror = require('react-codemirror');

const options = {
  lineNumbers: true,
  autoCloseBrackets: true,
  mode: 'javascript',
  theme: 'blackboard',
};

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  paper: {
    height: '50vh',
    padding: theme.spacing(2),
  },
}));

const CodeWindow = (props) => {
  const classes = useStyles();
  const { setQuestionData, questionData, time, name } = props;
  const [redirection, setRedirection] = useState(false);
  // console.log('name', name);
  const [codeWindowData, setCodeWindowData] = useState({
    name: '',
    problem: '',
    example1: '',
    example2: '',
    tests: '',
    defaultInput: 'function isDuplicates(){}',
  });

  const updateCode = (e) => {
    setQuestionData({ ...questionData, input: e });
  };

  const handleResetCode = (e) => {
    setQuestionData({
      input: '',
      output: '',
    });
  };

  useEffect(() => {
    getData();
    // todo: set the default input
  }, []);
  const getData = async () => {
    const res = await axios.get(`/api/challenges`);
    setCodeWindowData(res.data);
  };
  // console.log("Here is a CW Data: ", codeWindowData.tests.test1);

  // console.log(questionData.todayQuestion);
  // ! handle code run
  const handleCodeRun = (e) => {
    e.preventDefault();
    console.log('==========in run code');
    const outputString = questionData.input;
    // console.log('props', this.props);
    const regex = /console.log/gi;
    const output = outputString.replace(regex, 'outputArray.push');
    console.log('output', output);
    let outputArray = [];
    eval(output);
    console.log('outputArray', outputArray);
    const renderArray = outputArray.map((e) => <div>{e}</div>);
    console.log('renderArray', renderArray);

    setQuestionData({
      ...questionData,
      input: questionData.input,
      output: renderArray,
    });
  };

  // ! code submit then redirect to the leaderboard, which happens after submitted

  // const handleCodeSubmit = (e) => {
  //   e.preventDefault();
  //   let outputData = eval("(" + questionData.input + ")")();
  //   outputData = JSON.stringify(outputData);
  //   console.log("this is output ", outputData);

  //   // todo: do test case checks here

  //   let consoleData = eval("(" + questionData.input + ")");
  //   console.log("this is console data in handleCodeSubmit", consoleData);
  //   setQuestionData({
  //     ...questionData,
  //     input: questionData.input,
  //     output: outputData,
  //   });
  //   postData();
  // };
  const handleCodeSubmit = (e) => {
    e.preventDefault();

    // let outputData = eval("(" + questionData.input + ")")();
    // outputData = JSON.stringify(outputData);
    // console.log("this is output ", outputData);
    let passed = true;
    const tests = questionData.todayQuestion.tests;
    const callString = questionData.todayQuestion.callString;

    console.log('handleCodeSubmit -> tests', tests);
    const testOutput = [];
    for (let indTest in tests) {
      console.log('===============================', tests);
      if (indTest === 'callString') break;
      const testEnv = `
      ${tests[indTest].parameters}
      ${questionData.input}
      ${callString}
      `;
      eval(testEnv);
      if (eval(testEnv) == tests[indTest].expectedOutput) {
        console.log('this is tesEnv ', eval(testEnv));
        console.log('PASSED!');
        testOutput.push(<div>{tests[indTest].title} : Passed!</div>);
      } else {
        console.log('this is tesEnv ', eval(testEnv));
        console.log('FAILED!');
        passed = false;
        testOutput.push(
          <div>
            {tests[indTest].title} : Failed /n Expected:{' '}
            {tests[indTest].expectedOutput}/nReceived:{eval(testEnv)}
          </div>
        );
      }
    }
    if (passed) {
      console.log('YOU DID IT! YAY!');
      // redirect
      setRedirection(true);
      postData();
    } // ADD IN PASSING FUNCTIONALITY HERE
    // RENDER testOutput;
    // todo: do test case checks here
    // let consoleData = eval("(" + questionData.input + ")");
    // console.log("this is console data in handleCodeSubmit", consoleData);
    // setQuestionData({
    //   input: questionData.input,
    //   output: outputData,
    // });
  };

  const postData = async () => {
    let body = {
      name: name,
      // challengeName: questionData.name,
      time: time.seconds,
    };
    await axios.post('/api/submissions', body);
    // ! create a redirect
    console.log('we are here');
    // todo: does not work rn
    return <Redirect to="/leaderboard" />;
  };
  // console.log("This is questionData: ", questionData.output);
  return redirection ? (
    <Redirect to="/leaderboard" />
  ) : (
    <div className={classes.root}>
      <div className="codemirror">
        <CodeMirror
          defaultValue={codeWindowData.defaultInput}
          onChange={updateCode}
          options={options}
        />
      </div>
      <Button variant="contained" onClick={handleResetCode}>
        Reset
      </Button>
      {/* We need to figure this out */}
      <Button variant="contained" color="secondary" onClick={handleCodeRun}>
        Run
      </Button>
      <Button variant="contained" color="primary" onClick={handleCodeSubmit}>
        Submit
      </Button>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <b>return output:</b>

          <div>{questionData.output}</div>
        </Paper>
      </Grid>
      {/* create a box for vertical */}
    </div>
  );
};

export default CodeWindow;
