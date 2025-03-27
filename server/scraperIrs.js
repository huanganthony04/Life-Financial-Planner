import mongoose from 'mongoose'
import axios from 'axios'
import { load } from 'cheerio'
import FederalTax from './models/taxModel.js'  

import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URL
console.log("Connecting to:", MONGO_URI);

async function main() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB.')

    const taxBracketsUrl = 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets'
    const { data: taxHtml } = await axios.get(taxBracketsUrl)
    const $tax = load(taxHtml)

    const taxTables = $tax('table')
    console.log(`Found ${taxTables.length} tables on the tax brackets page.`)
    taxTables.each((i, table) => {
      console.log(`Tax Table ${i} classes: ${$tax(table).attr('class') || 'none'}`)
    })

    const taxTable = $tax('table.complex-table.table-striped.table-bordered.table-responsive').first()
    if (!taxTable || taxTable.length === 0) {
      console.log('No tax brackets table matching the selector was found. Please adjust your selector.')
    }
    const taxBrackets = []
    taxTable.find('tbody tr').each((i, row) => {
      const cols = $tax(row).find('td')
      if (cols.length >= 3) {
        let rateStr = $tax(cols[0]).text().trim()
        let minStr = $tax(cols[1]).text().trim()
        let maxStr = $tax(cols[2]).text().trim()

        rateStr = rateStr.replace(/[^\d.]/g, '')
        minStr = minStr.replace(/[^\d.]/g, '')
        maxStr = maxStr.replace(/[^\d.]/g, '')

        const rate = parseFloat(rateStr) || 0
        const min = parseFloat(minStr) || 0
        const max = parseFloat(maxStr) || 0

        taxBrackets.push({ min, max, rate })
      }
    })
    console.log('Scraped tax brackets:', taxBrackets)
    const stdDeductionUrl = 'https://www.irs.gov/publications/p17#en_US_2024_publink1000283782'
    const { data: stdDeductionHtml } = await axios.get(stdDeductionUrl)
    const $std = load(stdDeductionHtml)

    const stdTables = $std('table')
    console.log(`Found ${stdTables.length} tables on the standard deduction page.`)
    stdTables.each((i, table) => {
      console.log(`Standard Deduction Table ${i} classes: ${$std(table).attr('class') || 'none'}`)
    })

    const stdDeductionTable = $std('table.table-condensed[summary="Table 10-1.Standard Deduction Chart for Most People*"]')
    if (!stdDeductionTable || stdDeductionTable.length === 0) {
      console.log('No standard deduction table found. Check your selector.')
    }

    let standardDeductionSingle = 0
    let standardDeductionMarried = 0
    let standardDeductionHeadOfHousehold = 0

    stdDeductionTable.find('tbody tr').each((i, row) => {
      const cols = $std(row).find('td')
      if (cols.length === 2) {
        const filingStatus = $std(cols[0]).text().trim()
        let deductionStr = $std(cols[1]).text().trim()
        if (
          filingStatus.startsWith('IF your filing status is') ||
          !/\d/.test(deductionStr)
        ) {
          return
        }

        deductionStr = deductionStr.replace(/[^\d.]/g, '')
        const deduction = parseFloat(deductionStr) || 0

        if (filingStatus.includes('Single') || filingStatus.includes('Married filing separately')) {
          standardDeductionSingle = deduction
        } else if (filingStatus.includes('Married filing jointly') || filingStatus.includes('Qualifying surviving spouse')) {
          standardDeductionMarried = deduction
        } else if (filingStatus.includes('Head of household')) {
          standardDeductionHeadOfHousehold = deduction
        }
      }
    })

    console.log('Standard Deduction Data:', {
      standardDeductionSingle,
      standardDeductionMarried,
      standardDeductionHeadOfHousehold
    })

    const capitalGainsUrl = 'https://www.irs.gov/taxtopics/tc409'
    const { data: cgHtml } = await axios.get(capitalGainsUrl)
    const $cg = load(cgHtml)

    const cgDiv = $cg('div.field.field--name-body.field--type-text-with-summary.field--label-hidden.field--item');
    if (!cgDiv || cgDiv.length === 0) {
      console.log('Capital gains data div not found. Please check your selector.')
    }

    const ulTags = cgDiv.find('ul')
    if (ulTags.length < 2) {
      console.log('Expected at least two <ul> tags for capital gains data. Found:', ulTags.length)
    }

    const ul0 = $cg(ulTags[0])
    const li0 = ul0.find('li')
    const thresholds0 = []
    li0.each((i, li) => {
      const text = $cg(li).text().trim()
      const match = text.match(/\$([\d,]+)/)
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''))
        thresholds0.push(value)
      }
    })
    console.log('0% Capital Gains Thresholds:', thresholds0)

    const ul1 = $cg(ulTags[1])
    const li1 = ul1.find('li')
    const thresholds15 = []
    li1.each((i, li) => {
      const text = $cg(li).text().trim()
      const match = text.match(/\$([\d,]+)/)
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''))
        thresholds15.push(value)
      }
    })

    const single0Threshold = thresholds0[0] || 0
    const single15Threshold = thresholds15[0] || 0

    const capitalGainsBrackets = [
      { min: 0, max: single0Threshold, rate: 0 },
      { min: single0Threshold + 0.01, max: single15Threshold, rate: 15 },
      { min: single15Threshold + 0.01, max: Infinity, rate: 20 }
    ]

    await FederalTax.findOneAndUpdate(
      { year: 2024 },
      {
        year: 2024,
        taxBrackets,
        standardDeductionSingle,
        standardDeductionMarried,
        standardDeductionHeadOfHousehold,
        capitalGainsBrackets
      },
      { upsert: true, new: true }
    )
    console.log('Successfully upserted Federal tax data for year 2024.')

  } catch (err) {
    console.error('Error scraping IRS data:', err)

  }
}

export default main
