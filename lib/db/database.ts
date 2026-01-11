// Database setup for hotel contract intelligence
// Real enterprise-grade persistence with SQLite (upgradable to Postgres)

import Database from 'better-sqlite3';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const DB_PATH = join(process.cwd(), 'hotel-contracts.db');

// Zod schema for validation
const ContractSchema = z.object({
  hotelName: z.string().min(1),
  fileName: z.string(),
  fileFormat: z.enum(['pdf', 'excel', 'word']),
  contractStartDate: z.string(),
  contractEndDate: z.string(),
  currency: z.string().length(3),
  cancellationPolicy: z.string().optional(),
  paymentTerms: z.string().optional(),
  extractionMethod: z.enum(['vision', 'text', 'hybrid']),
  confidence: z.number().min(0).max(1),
});

const RoomRateSchema = z.object({
  roomType: z.string().min(1),
  season: z.enum(['Low', 'Mid', 'High', 'Peak', 'Year-round']),
  rate: z.number().positive(),
  mealPlan: z.enum(['RO', 'BB', 'HB', 'FB', 'AI']),
  currency: z.string().length(3),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

type RoomRate = z.infer<typeof RoomRateSchema>;

export interface Contract {
  id: number;
  hotelName: string;
  fileName: string;
  fileFormat: 'pdf' | 'excel' | 'word';
  contractStartDate: string;
  contractEndDate: string;
  currency: string;
  cancellationPolicy?: string;
  paymentTerms?: string;
  extractionMethod: 'vision' | 'text' | 'hybrid';
  confidence: number;
  createdAt: string;
  updatedAt: string;
  roomRates: RoomRate[];
}

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH, { verbose: console.log });
    
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_format TEXT NOT NULL CHECK (file_format IN ('pdf', 'excel', 'word')),
        file_data BLOB,
        contract_start_date TEXT NOT NULL,
        contract_end_date TEXT NOT NULL,
        currency CHAR(3) NOT NULL,
        cancellation_policy TEXT,
        payment_terms TEXT,
        extraction_method TEXT NOT NULL CHECK (extraction_method IN ('vision', 'text', 'hybrid')),
        confidence REAL DEFAULT 0.85,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS room_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        room_type TEXT NOT NULL,
        season TEXT NOT NULL CHECK (season IN ('Low', 'Mid', 'High', 'Peak', 'Year-round')),
        rate REAL NOT NULL,
        meal_plan CHAR(2) NOT NULL CHECK (meal_plan IN ('RO', 'BB', 'HB', 'FB', 'AI')),
        currency CHAR(3) NOT NULL,
        valid_from TEXT,
        valid_to TEXT,
        confidence REAL DEFAULT 0.85
      );

      CREATE INDEX IF NOT EXISTS idx_contracts_hotel ON contracts(hotel_name);
      CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(contract_start_date, contract_end_date);
      CREATE INDEX IF NOT EXISTS idx_room_rates_contract ON room_rates(contract_id);
    `);
    
    console.log('Database initialized at:', DB_PATH);
  }
  return db;
}

export function dbOperations() {
  const database = getDb();
  
  return {
    // Contract operations
    saveContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract => {
      const stmt = database.prepare(`
        INSERT INTO contracts (
          hotel_name, file_name, file_format, file_data,
          contract_start_date, contract_end_date, currency,
          cancellation_policy, payment_terms,
          extraction_method, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        contract.hotelName,
        contract.fileName,
        contract.fileFormat,
        contract.fileData,
        contract.contractStartDate,
        contract.contractEndDate,
        contract.currency,
        contract.cancellationPolicy || null,
        contract.paymentTerms || null,
        contract.extractionMethod,
        contract.confidence
      );
      
      const contractId = result.lastInsertRowid as number;
      
      // Save room rates
      const rateStmt = database.prepare(`
        INSERT INTO room_rates (
          contract_id, room_type, season, rate, meal_plan,
          currency, valid_from, valid_to, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      contract.roomRates.forEach(rate => {
        rateStmt.run(
          contractId,
          rate.roomType,
          rate.season,
          rate.rate,
          rate.mealPlan,
          rate.currency,
          rate.validFrom || null,
          rate.validTo || null,
          contract.confidence
        );
      });
      
      // Get full contract with ID
      return getContractById(contractId);
    },
    
    getContractById: (id: number): Contract | null => {
      const contract = database.prepare(`
        SELECT * FROM contracts WHERE id = ?
      `).get(id) as any;
      
      if (!contract) return null;
      
      const rates = database.prepare(`
        SELECT * FROM room_rates WHERE contract_id = ?
      `).all(id) as RoomRate[];
      
      return {
        ...contract,
        roomRates: rates,
      };
    },
    
    getAllContracts: (): Contract[] => {
      const contracts = database.prepare(`
        SELECT * FROM contracts ORDER BY created_at DESC LIMIT 100
      `).all() as any[];
      
      return contracts.map(contract => {
        const rates = database.prepare(`
          SELECT * FROM room_rates WHERE contract_id = ?
        `).all(contract.id) as RoomRate[];
        
        return {
          ...contract,
          roomRates: rates,
        };
      });
    },
    
    updateContract: (id: number, updates: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>): void => {
      const fields = [];
      const values = [];
      
      if (updates.hotelName !== undefined) {
        fields.push('hotel_name = ?');
        values.push(updates.hotelName);
      }
      if (updates.contractStartDate !== undefined) {
        fields.push('contract_start_date = ?');
        values.push(updates.contractStartDate);
      }
      if (updates.contractEndDate !== undefined) {
        fields.push('contract_end_date = ?');
        values.push(updates.contractEndDate);
      }
      if (updates.currency !== undefined) {
        fields.push('currency = ?');
        values.push(updates.currency);
      }
      if (updates.cancellationPolicy !== undefined) {
        fields.push('cancellation_policy = ?');
        values.push(updates.cancellationPolicy);
      }
      if (updates.paymentTerms !== undefined) {
        fields.push('payment_terms = ?');
        values.push(updates.paymentTerms);
      }
      if (updates.confidence !== undefined) {
        fields.push('confidence = ?');
        values.push(updates.confidence);
      }
      
      values.push(id);
      
      database.prepare(`
        UPDATE contracts SET ${fields.join(', ')} WHERE id = ?
      `).run(...values);
    },
    
    deleteContract: (id: number): void => {
      // Room rates deleted by CASCADE
      database.prepare('DELETE FROM contracts WHERE id = ?').run(id);
    },
    
    // Stats
    getStats: () => {
      const contracts = database.prepare('SELECT COUNT(*) as count FROM contracts').get() as { count: number };
      const avgConfidence = database.prepare('SELECT AVG(confidence) as avg_conf FROM contracts').get() as { avg_conf: number };
      
      return {
        totalContracts: contracts.count,
        averageConfidence: avgConfidence.avg_conf,
      };
    },
    
    close: () => {
      if (db) {
        db.close();
        db = null;
      }
    },
  };
}
