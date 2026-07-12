import User from '../models/User.model.js';
import Driver from '../models/Driver.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function generateToken(id, role){
    const my_secret_key = process.env.MY_SECRET_KEY;
    
    return jwt.sign({id, role},my_secret_key,{expiresIn: '30d'})
}

const registerUser = async (req,res) => {
    try {
        const {name, email, password, role} = req.body;

        if(!name || !email || !password || !role) {
            return res.status(400).json({message : "Please Fill all mandatory fields"});
        }
        if(!(role == "FleetManager" || role == "Driver" || role == "SafetyOfficer" || role == "FinancialAnalyst")) {
            return res.status(400).json({message : "Invalid Role. Please choose a valid role."});
        } 

        const userExists = await User.findOne({email});
        if(userExists) {
            return res.status(409).json({message : "User already exists"})
        }
        
        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        // Automatically create a Driver profile if the user signs up as a Driver
        // We link the _id so that user._id perfectly matches driver._id for dispatch logic
        if (role === 'Driver') {
            await Driver.create({
                _id: user._id,
                name: user.name,
                licenseNumber: `PENDING-${user._id.toString().slice(-6)}`,
                licenseCategory: 'Pending',
                licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
                contactNumber: 'Pending',
                status: 'Available'
            });
        }

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        res.status(500).json({message: "Signup Failed", error: error.message })
    }
};

const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({message: "User Not Found"});
        }
        
        // Password Match
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        // Attach JWT token and return back;
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        })

    } catch (error) {
        res.status(500).json({message: "Login Failed", error: error.message});
    }
}

export { registerUser, loginUser };