export const validateSchema = (schema) => (req,res,next) => {
    try {
        //compara los dato del request body con el del schema
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json(error.errors.map((error) => error.message));
    }
}

