import { Alert, Box, Button, Card, Input, Stack, Typography } from '@mui/material'
import axios from 'axios';
import { useState } from 'react'

const axiosConfig = {
  baseURL: import.meta.env.VITE_API_URL
};

function App() {

  // Setup axios base URL
  axios.defaults.baseURL = axiosConfig.baseURL;

  const [inputText, setInputText] = useState('')
  const [textLog, setTextLog] = useState([])

  const fakeSentimentAnalysis = (text) => {
    // This is just a fake function to simulate the sentiment analysis
    const input = text;
    const randomFloat = Math.random();
    console.log(randomFloat);
    if (randomFloat > 0.5) {
      return 'positive';
    } else if (randomFloat < 0.5) {
      return 'negative';
    } else {
      return 'unknown';
    }
  };

  const sentimentAnalysis = async (text) => {
    // This is the real sentiment analysis function
    try {
      const {data: { sentiment }} = await axios.post('/sentiment', {text: text}, {headers: {"Access-Control-Allow-Origin": "*"}})
      return sentiment;
    } catch (error) {
      console.log("Could not analyze sentiment", error)
      return 'unknown'
    }
  }


  const handleButton = async () => {

    // Check if the input text is empty
    if (inputText === '') {
      return
    }

    try {
      // Analyze and reformat the output
      const sentiment = await sentimentAnalysis(inputText)
      const analysis = {
        text: inputText,
        sentiment: sentiment,
      }

      // Push the new text to the log
      const newTextLog = [analysis, ...textLog]
      setTextLog(newTextLog)
      console.log(newTextLog)   
      
      // Clear the input text
      setInputText('')

    } catch (error) {
      
    }

  }

  return (
    <>
    <Box sx={{maxWidth: 500, maxHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Card sx={{m:2, flexShrink:0, p:2}}>
        <Typography variant="h5">Sentiment analysis front-end</Typography>
        <Typography variant="body1">This model will predict the overall verdict of your sentence.</Typography>
        <Stack sx={{mt:2}} direction='row'>
          <Input
           fullWidth
           placeholder="Type something here"
           onChange={(event) => setInputText(event.target.value)}
           onKeyDown={(event) => {if (event.key === 'Enter') handleButton()}}
           value={inputText}
          />
          <Button
           onClick={handleButton}
           >
            Predict
          </Button>
        </Stack>
      </Card>
      <Box sx={{flexGrow:0, flexShrink: 1, overflowY: 'auto'}}>
        {textLog.map((analysis, index) => (
          <SentimentInfo key={index} sentiment={analysis.sentiment}>
            {analysis.text}
          </SentimentInfo>
        ))}
      </Box>
    </Box>
    </>
  )
}

function SentimentInfo({children, sentiment}) {

  let severity = 'info'
  if (sentiment === 'positive') {
    severity = 'success'
  } else if (sentiment === 'negative') {
    severity = 'error'
  }

  return (
    <Alert sx={{m:2}} icon={<></>} severity={severity}>
      <Stack direction='column'>
        <Typography variant='body1'>
          {children}
        </Typography>
        <Typography variant='button'>
          {sentiment}
        </Typography>
      </Stack>
    </Alert>
  )
}

export default App
